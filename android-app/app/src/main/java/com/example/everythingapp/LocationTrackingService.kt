package com.example.everythingapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import org.json.JSONArray
import org.json.JSONObject
import java.util.Collections
import kotlin.math.roundToInt

class LocationTrackingService : Service(), LocationListener {

    companion object {
        const val TAG = "LocationTrackingService"
        const val CHANNEL_ID = "everything_app_tracking_channel"
        const val NOTIFICATION_ID = 4040

        const val ACTION_START = "com.example.everythingapp.ACTION_START"
        const val ACTION_STOP = "com.example.everythingapp.ACTION_STOP"
        const val EXTRA_ACTIVITY_TYPE = "EXTRA_ACTIVITY_TYPE"

        private val bufferedPoints = Collections.synchronizedList(mutableListOf<JSONObject>())
        private var isServiceActive = false
        private var listenerCallback: ((String) -> Unit)? = null

        fun isRunning(): Boolean = isServiceActive

        fun registerUpdateListener(callback: ((String) -> Unit)?) {
            listenerCallback = callback
        }

        fun getBufferedPointsJson(): String {
            synchronized(bufferedPoints) {
                val array = JSONArray()
                for (p in bufferedPoints) {
                    array.put(p)
                }
                bufferedPoints.clear() // Drain buffered points so they are never re-ingested
                return array.toString()
            }
        }

        fun clearBufferedPoints() {
            synchronized(bufferedPoints) {
                bufferedPoints.clear()
            }
        }
    }

    private var locationManager: LocationManager? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private var activityType: String = "run"
    private var startTimeMs: Long = 0L
    private var lastLocation: Location? = null
    private var totalDistanceMeters: Double = 0.0

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        locationManager = getSystemService(Context.LOCATION_SERVICE) as? LocationManager

        val powerManager = getSystemService(Context.POWER_SERVICE) as? PowerManager
        wakeLock = powerManager?.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "EverythingApp:WorkoutTrackingWakeLock"
        )?.apply {
            setReferenceCounted(false)
        }
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val action = intent?.action

        if (action == ACTION_STOP) {
            stopTracking()
            return START_NOT_STICKY
        }

        activityType = intent?.getStringExtra(EXTRA_ACTIVITY_TYPE) ?: "run"
        startTracking()
        return START_STICKY
    }

    private fun startTracking() {
        if (isServiceActive) return
        isServiceActive = true
        startTimeMs = System.currentTimeMillis()
        totalDistanceMeters = 0.0
        lastLocation = null
        clearBufferedPoints()

        // 1. Acquire WakeLock to keep CPU running when screen is locked
        try {
            wakeLock?.acquire(12 * 60 * 60 * 1000L) // 12 hours max safety
            Log.d(TAG, "WakeLock acquired for background tracking")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to acquire wake lock", e)
        }

        // 2. Start Foreground Notification
        val notification = buildNotification("Starting GPS tracking...", "Preparing accurate satellite lock")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(
                NOTIFICATION_ID,
                notification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION
            )
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        // 3. Register high-accuracy GPS satellite location listener
        try {
            locationManager?.let { lm ->
                if (lm.isProviderEnabled(LocationManager.GPS_PROVIDER)) {
                    lm.requestLocationUpdates(
                        LocationManager.GPS_PROVIDER,
                        1000L, // 1 second
                        0.5f,  // 0.5 meter
                        this
                    )
                    Log.d(TAG, "GPS_PROVIDER location listener registered")
                }
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "Missing location permissions for background service", e)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting location updates", e)
        }
    }

    private fun stopTracking() {
        isServiceActive = false
        try {
            locationManager?.removeUpdates(this)
        } catch (e: Exception) {
            Log.e(TAG, "Error removing location updates", e)
        }

        try {
            if (wakeLock?.isHeld == true) {
                wakeLock?.release()
                Log.d(TAG, "WakeLock released")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error releasing wake lock", e)
        }

        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onLocationChanged(loc: Location) {
        // Drop noisy fixes with wide accuracy bubbles
        if (loc.hasAccuracy() && loc.accuracy > 16.0f) {
            return
        }

        val speedKmh = if (loc.hasSpeed()) loc.speed * 3.6f else 0f

        // Doppler-guided distance accumulation
        val last = lastLocation
        var distDelta = 0.0
        if (last != null) {
            val d = last.distanceTo(loc).toDouble()
            val dtSec = Math.max(0.2, (loc.time - last.time) / 1000.0)

            // Stationary noise gate: ignore when speed < 2.2 km/h
            if (speedKmh > 2.2f && d >= 1.0) {
                // Bound distance delta to Doppler physical velocity to prevent 4x GPS jitter inflation
                val maxAllowed = (loc.speed * dtSec * 1.3) + 0.4
                distDelta = Math.min(d, maxAllowed)
                totalDistanceMeters += distDelta
                lastLocation = loc
            }
        } else {
            lastLocation = loc
        }

        val pointJson = JSONObject().apply {
            put("latitude", loc.latitude)
            put("longitude", loc.longitude)
            put("altitude", if (loc.hasAltitude()) loc.altitude else 0.0)
            put("speed", speedKmh)
            put("accuracy", if (loc.hasAccuracy()) loc.accuracy else 5.0f)
            put("bearing", if (loc.hasBearing()) loc.bearing else 0.0f)
            put("timestamp", loc.time)
            put("distanceTotalMeters", totalDistanceMeters)
        }

        synchronized(bufferedPoints) {
            bufferedPoints.add(pointJson)
        }

        // Update Notification with live telemetry on lock screen
        val elapsedSec = ((System.currentTimeMillis() - startTimeMs) / 1000).toInt()
        val minutes = elapsedSec / 60
        val seconds = elapsedSec % 60
        val timeStr = String.format("%02d:%02d", minutes, seconds)
        val distKm = totalDistanceMeters / 1000.0
        val distStr = String.format("%.2f km", distKm)
        val speedStr = String.format("%.1f km/h", speedKmh)

        val sportEmoji = when (activityType.lowercase()) {
            "cycle", "ride" -> "🚴"
            "walk" -> "🚶"
            "drive" -> "🚗"
            else -> "🏃"
        }

        val title = "$sportEmoji Everything App Tracking • $distStr"
        val content = "Time: $timeStr | Speed: $speedStr"

        val notification = buildNotification(title, content)
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
        nm?.notify(NOTIFICATION_ID, notification)

        // Notify UI listener (WebView) in real time
        try {
            listenerCallback?.invoke(pointJson.toString())
        } catch (e: Exception) {
            Log.e(TAG, "Callback failed", e)
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}

    override fun onProviderEnabled(provider: String) {}

    override fun onProviderDisabled(provider: String) {}

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        stopTracking()
        super.onDestroy()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Workout GPS Tracking",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Shows live GPS workout stats on lock screen and keeps tracking active in background"
                setShowBadge(false)
            }
            val nm = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
            nm?.createNotificationChannel(channel)
        }
    }

    private fun buildNotification(title: String, content: String): Notification {
        val launchIntent = packageManager.getLaunchIntentForPackage(packageName)?.apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(content)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_WORKOUT)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .build()
    }
}

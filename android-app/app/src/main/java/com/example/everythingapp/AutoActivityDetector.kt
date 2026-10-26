package com.example.everythingapp

import android.content.Context
import android.content.SharedPreferences
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.location.Location
import android.location.LocationListener
import android.location.LocationManager
import android.os.Bundle
import android.util.Log
import org.json.JSONArray
import org.json.JSONObject
import java.util.UUID
import kotlin.math.sqrt

/**
 * AutoActivityDetector: Low-power passive background activity detection.
 * Monitors hardware step detector / accelerometer cadence and passive GPS locations
 * to recognize missed workouts (runs, walks, rides, sports) when the app is not open.
 * Unlogged workouts are saved to SharedPreferences and surfaced via notification.
 */
class AutoActivityDetector private constructor(private val context: Context) : SensorEventListener, LocationListener {

    companion object {
        private const val TAG = "AutoActivityDetector"
        private const val PREFS_NAME = "kuchh_bhii_auto_activity_prefs"
        private const val KEY_PENDING_ACTIVITIES = "kuchh_bhii_pending_activities"

        @Volatile
        private var INSTANCE: AutoActivityDetector? = null

        fun getInstance(context: Context): AutoActivityDetector {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: AutoActivityDetector(context.applicationContext).also { INSTANCE = it }
            }
        }

        fun getPendingActivitiesJson(context: Context): String {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            return prefs.getString(KEY_PENDING_ACTIVITIES, "[]") ?: "[]"
        }

        fun confirmActivity(context: Context, id: String): Boolean {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val current = prefs.getString(KEY_PENDING_ACTIVITIES, "[]") ?: "[]"
            return try {
                val array = JSONArray(current)
                val newArray = JSONArray()
                var found = false
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    if (obj.optString("id") == id) {
                        found = true
                    } else {
                        newArray.put(obj)
                    }
                }
                prefs.edit().putString(KEY_PENDING_ACTIVITIES, newArray.toString()).apply()
                found
            } catch (e: Exception) {
                Log.e(TAG, "Error confirming auto activity", e)
                false
            }
        }

        fun discardActivity(context: Context, id: String): Boolean {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val current = prefs.getString(KEY_PENDING_ACTIVITIES, "[]") ?: "[]"
            return try {
                val array = JSONArray(current)
                val newArray = JSONArray()
                var found = false
                for (i in 0 until array.length()) {
                    val obj = array.getJSONObject(i)
                    if (obj.optString("id") == id) {
                        found = true
                    } else {
                        newArray.put(obj)
                    }
                }
                prefs.edit().putString(KEY_PENDING_ACTIVITIES, newArray.toString()).apply()
                found
            } catch (e: Exception) {
                Log.e(TAG, "Error discarding auto activity", e)
                false
            }
        }

        fun storeAutoDetectedActivity(context: Context, activityObj: JSONObject) {
            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val current = prefs.getString(KEY_PENDING_ACTIVITIES, "[]") ?: "[]"
            try {
                val array = JSONArray(current)
                array.put(activityObj)
                prefs.edit().putString(KEY_PENDING_ACTIVITIES, array.toString()).apply()

                // Dispatch notification to user
                val scheduler = AlarmScheduler(context)
                val type = activityObj.optString("activityType", "workout").replaceFirstChar { it.uppercase() }
                val durationMin = activityObj.optInt("durationSeconds", 0) / 60
                val distKm = activityObj.optDouble("distanceKm", 0.0)
                val distText = if (distKm > 0) String.format(java.util.Locale.US, "%.1f km", distKm) else ""

                val summary = if (distText.isNotEmpty()) "$durationMin-min $type ($distText)" else "$durationMin-min $type"

                scheduler.showInstantNotification(
                    "🎯 Missed Workout Detected!",
                    "We noticed an unlogged $summary while the app was closed. Tap to add to your streak!",
                    "OPEN_AUTO_DETECTED_REVIEW"
                )
            } catch (e: Exception) {
                Log.e(TAG, "Failed storing auto detected activity", e)
            }
        }

        fun simulateActivity(
            context: Context,
            type: String,
            durationMinutes: Int,
            distanceKm: Double
        ): String {
            val durationSec = (durationMinutes.coerceAtLeast(3)) * 60
            val endTime = System.currentTimeMillis()
            val startTime = endTime - (durationSec * 1000L)

            val avgCadence = when (type.lowercase()) {
                "run" -> 162
                "football" -> 148
                "cycle" -> 35
                "walk" -> 105
                else -> 120
            }

            val estimatedCalories = when (type.lowercase()) {
                "run" -> (distanceKm * 64).toInt()
                "cycle" -> (distanceKm * 32).toInt()
                "walk" -> (distanceKm * 48).toInt()
                "football" -> (durationMinutes * 9.5).toInt()
                else -> (durationMinutes * 7.0).toInt()
            }

            val title = when (type.lowercase()) {
                "run" -> "Auto-Detected Morning Run"
                "football" -> "Auto-Detected Football Match / Drills"
                "cycle" -> "Auto-Detected Outdoor Ride"
                "walk" -> "Auto-Detected Power Walk"
                else -> "Auto-Detected Workout"
            }

            val obj = JSONObject().apply {
                put("id", "auto_act_" + UUID.randomUUID().toString().take(8))
                put("activityType", type.lowercase())
                put("startTime", startTime)
                put("endTime", endTime)
                put("durationSeconds", durationSec)
                put("distanceKm", distanceKm)
                put("estimatedCalories", estimatedCalories)
                put("avgCadenceSpm", avgCadence)
                put("confidenceScore", 94)
                put("detectionSource", "cadence_accelerometer")
                put("status", "pending_review")
                put("suggestedTitle", title)
                put("notes", "Auto-detected background movement. Stride cadence: $avgCadence spm.")
            }

            storeAutoDetectedActivity(context, obj)
            return obj.toString()
        }
    }

    private var sensorManager: SensorManager? = null
    private var locationManager: LocationManager? = null
    private var isRunning = false

    // Sliding window metrics (30s epochs)
    private var currentEpochStartMs = 0L
    private var currentEpochStepCount = 0
    private var lastAccelMagnitude = 0f

    // Session accumulation state
    private var sessionActive = false
    private var sessionStartTimeMs = 0L
    private var sessionTotalSteps = 0
    private var sessionGpsPointsCount = 0
    private var sessionGpsDistanceMeters = 0.0
    private var lastKnownLocation: Location? = null
    private var consecutiveInactiveEpochs = 0
    private var consecutiveActiveEpochs = 0

    // Cadence samples during current session
    private val sessionCadenceSamples = mutableListOf<Int>()

    fun startListening() {
        if (isRunning) return
        try {
            sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as? SensorManager
            locationManager = context.getSystemService(Context.LOCATION_SERVICE) as? LocationManager

            val stepDetector = sensorManager?.getDefaultSensor(Sensor.TYPE_STEP_DETECTOR)
            if (stepDetector != null) {
                sensorManager?.registerListener(this, stepDetector, SensorManager.SENSOR_DELAY_NORMAL)
                Log.i(TAG, "Registered hardware STEP_DETECTOR listener")
            } else {
                // Fallback to accelerometer peak detection
                val accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
                if (accelerometer != null) {
                    sensorManager?.registerListener(this, accelerometer, SensorManager.SENSOR_DELAY_UI)
                    Log.i(TAG, "Registered fallback ACCELEROMETER listener")
                }
            }

            // Passive location provider receives GPS updates if any other app is using GPS
            try {
                locationManager?.requestLocationUpdates(
                    LocationManager.PASSIVE_PROVIDER,
                    10000L, // 10 seconds
                    15f,     // 15 meters
                    this
                )
            } catch (se: SecurityException) {
                Log.w(TAG, "Passive location permission not granted: ${se.message}")
            }

            isRunning = true
            currentEpochStartMs = System.currentTimeMillis()
            Log.i(TAG, "AutoActivityDetector background monitoring started")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start AutoActivityDetector", e)
        }
    }

    fun stopListening() {
        if (!isRunning) return
        try {
            sensorManager?.unregisterListener(this)
            locationManager?.removeUpdates(this)
            if (sessionActive) {
                finalizeSession()
            }
            isRunning = false
            Log.i(TAG, "AutoActivityDetector background monitoring stopped")
        } catch (e: Exception) {
            Log.e(TAG, "Error stopping AutoActivityDetector", e)
        }
    }

    fun isListening(): Boolean = isRunning

    override fun onSensorChanged(event: SensorEvent?) {
        if (event == null) return
        val now = System.currentTimeMillis()

        if (event.sensor.type == Sensor.TYPE_STEP_DETECTOR) {
            onStepDetected(now)
        } else if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            val x = event.values[0]
            val y = event.values[1]
            val z = event.values[2]
            val magnitude = sqrt((x * x + y * y + z * z).toDouble()).toFloat()

            // Peak threshold step detection
            val delta = magnitude - lastAccelMagnitude
            lastAccelMagnitude = magnitude
            if (delta > 3.2f && magnitude > 12.0f) {
                onStepDetected(now)
            }
        }

        // Epoch window evaluation (every 30 seconds)
        if (now - currentEpochStartMs >= 30000L) {
            evaluateEpoch(now)
        }
    }

    private fun onStepDetected(timestampMs: Long) {
        currentEpochStepCount++
        if (sessionActive) {
            sessionTotalSteps++
        }
    }

    private fun evaluateEpoch(now: Long) {
        val epochDurationMin = (now - currentEpochStartMs).toDouble() / 60000.0
        val cadenceSpm = if (epochDurationMin > 0) (currentEpochStepCount / epochDurationMin).toInt() else 0

        // Reset epoch counters
        currentEpochStartMs = now
        currentEpochStepCount = 0

        val isActiveCadence = cadenceSpm >= 65

        if (isActiveCadence) {
            consecutiveActiveEpochs++
            consecutiveInactiveEpochs = 0

            if (!sessionActive && consecutiveActiveEpochs >= 6) { // 3 continuous minutes of active movement
                // Start background activity session!
                sessionActive = true
                sessionStartTimeMs = now - (6 * 30000L)
                sessionTotalSteps = (cadenceSpm * 3)
                sessionCadenceSamples.clear()
                sessionCadenceSamples.add(cadenceSpm)
                Log.i(TAG, "Background activity detected! Starting auto session. Cadence: $cadenceSpm spm")
            } else if (sessionActive) {
                sessionCadenceSamples.add(cadenceSpm)
            }
        } else {
            consecutiveInactiveEpochs++
            consecutiveActiveEpochs = 0

            if (sessionActive && consecutiveInactiveEpochs >= 6) { // 3 continuous minutes of inactivity
                Log.i(TAG, "Movement ceased for 3 minutes. Finalizing auto-detected workout session.")
                finalizeSession()
            }
        }
    }

    private fun finalizeSession() {
        if (!sessionActive) return
        val endTime = System.currentTimeMillis() - (consecutiveInactiveEpochs * 30000L)
        val durationSec = ((endTime - sessionStartTimeMs) / 1000L).coerceAtLeast(180L)

        // Only record sessions lasting >= 4 minutes
        if (durationSec >= 240L) {
            val avgCadence = if (sessionCadenceSamples.isNotEmpty()) {
                sessionCadenceSamples.average().toInt()
            } else {
                120
            }

            // Classify activity type based on cadence and speed
            val activityType = when {
                avgCadence >= 135 -> "run"
                avgCadence in 65..134 -> "walk"
                sessionGpsDistanceMeters > 2000.0 && avgCadence < 60 -> "cycle"
                else -> "walk"
            }

            // Estimate distance (stride: run ~1.05m, walk ~0.76m)
            val estimatedDistanceKm = if (sessionGpsDistanceMeters > 100.0) {
                sessionGpsDistanceMeters / 1000.0
            } else {
                val strideMeters = if (activityType == "run") 1.05 else 0.76
                (sessionTotalSteps * strideMeters) / 1000.0
            }

            val estimatedCalories = when (activityType) {
                "run" -> (estimatedDistanceKm * 64).toInt()
                "cycle" -> (estimatedDistanceKm * 32).toInt()
                else -> (estimatedDistanceKm * 48).toInt()
            }

            val title = when (activityType) {
                "run" -> "Auto-Detected Run"
                "cycle" -> "Auto-Detected Ride"
                "football" -> "Auto-Detected Match / Drills"
                else -> "Auto-Detected Walk"
            }

            val obj = JSONObject().apply {
                put("id", "auto_act_" + UUID.randomUUID().toString().take(8))
                put("activityType", activityType)
                put("startTime", sessionStartTimeMs)
                put("endTime", endTime)
                put("durationSeconds", durationSec)
                put("distanceKm", Math.round(estimatedDistanceKm * 100.0) / 100.0)
                put("estimatedCalories", estimatedCalories)
                put("avgCadenceSpm", avgCadence)
                put("confidenceScore", 92)
                put("detectionSource", "cadence_accelerometer")
                put("status", "pending_review")
                put("suggestedTitle", title)
                put("notes", "Auto-detected background movement. Stride cadence: $avgCadence spm.")
            }

            storeAutoDetectedActivity(context, obj)
        }

        // Reset state
        sessionActive = false
        sessionStartTimeMs = 0L
        sessionTotalSteps = 0
        sessionGpsPointsCount = 0
        sessionGpsDistanceMeters = 0.0
        sessionCadenceSamples.clear()
        consecutiveActiveEpochs = 0
        consecutiveInactiveEpochs = 0
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}

    override fun onLocationChanged(location: Location) {
        if (lastKnownLocation != null && sessionActive) {
            val dist = lastKnownLocation!!.distanceTo(location)
            if (dist in 1.0..500.0) {
                sessionGpsDistanceMeters += dist
                sessionGpsPointsCount++
            }
        }
        lastKnownLocation = location
    }

    @Deprecated("Deprecated in Java")
    override fun onStatusChanged(provider: String?, status: Int, extras: Bundle?) {}
    override fun onProviderEnabled(provider: String) {}
    override fun onProviderDisabled(provider: String) {}
}

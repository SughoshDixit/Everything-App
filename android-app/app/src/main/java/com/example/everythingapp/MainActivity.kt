package com.example.everythingapp

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.graphics.Color
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.ConsoleMessage
import android.webkit.GeolocationPermissions
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.webkit.WebViewAssetLoader
import android.content.ContentValues
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import android.webkit.JavascriptInterface
import android.widget.Toast
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream

class MainActivity : ComponentActivity() {

    private var webView: WebView? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Request runtime permissions
        val permissions = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }

        val neededPermissions = permissions.filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }
        if (neededPermissions.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, neededPermissions.toTypedArray(), 101)
        }

        enableEdgeToEdge()

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView?.canGoBack() == true) {
                    webView?.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        setContent {
            AppWebView(
                modifier = Modifier
                    .fillMaxSize()
                    .systemBarsPadding(),
                onWebViewCreated = { webView = it }
            )
        }
    }
}

class AndroidNativeBridge(private val context: Context) {

    @JavascriptInterface
    fun downloadBase64File(base64Data: String, fileName: String, mimeType: String): Boolean {
        return try {
            val cleanBase64 = if (base64Data.contains(",")) {
                base64Data.substringAfter(",")
            } else {
                base64Data
            }
            val bytes = Base64.decode(cleanBase64, Base64.DEFAULT)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                val contentValues = ContentValues().apply {
                    put(MediaStore.MediaColumns.DISPLAY_NAME, fileName)
                    put(MediaStore.MediaColumns.MIME_TYPE, mimeType)
                    if (mimeType.startsWith("video/")) {
                        put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_MOVIES + "/EverythingApp")
                    } else if (mimeType.startsWith("image/")) {
                        put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/EverythingApp")
                    } else {
                        put(MediaStore.MediaColumns.RELATIVE_PATH, Environment.DIRECTORY_DOWNLOADS + "/EverythingApp")
                    }
                }

                val collectionUri = when {
                    mimeType.startsWith("video/") -> MediaStore.Video.Media.EXTERNAL_CONTENT_URI
                    mimeType.startsWith("image/") -> MediaStore.Images.Media.EXTERNAL_CONTENT_URI
                    else -> MediaStore.Downloads.EXTERNAL_CONTENT_URI
                }

                val itemUri = context.contentResolver.insert(collectionUri, contentValues)
                if (itemUri != null) {
                    context.contentResolver.openOutputStream(itemUri)?.use { outputStream ->
                        outputStream.write(bytes)
                        outputStream.flush()
                    }
                    (context as? ComponentActivity)?.runOnUiThread {
                        Toast.makeText(context, "Saved to Gallery / Storage: $fileName", Toast.LENGTH_LONG).show()
                    }
                    return true
                }
            } else {
                val dir = Environment.getExternalStoragePublicDirectory(
                    if (mimeType.startsWith("video/")) Environment.DIRECTORY_MOVIES else Environment.DIRECTORY_PICTURES
                )
                dir.mkdirs()
                val targetFile = File(dir, fileName)
                FileOutputStream(targetFile).use { fos ->
                    fos.write(bytes)
                    fos.flush()
                }
                (context as? ComponentActivity)?.runOnUiThread {
                    Toast.makeText(context, "Saved to Gallery: ${targetFile.absolutePath}", Toast.LENGTH_LONG).show()
                }
                return true
            }
            false
        } catch (e: Exception) {
            Log.e("AndroidNativeBridge", "Download failed", e)
            (context as? ComponentActivity)?.runOnUiThread {
                Toast.makeText(context, "Download Error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
            false
        }
    }

    @JavascriptInterface
    fun shareBase64Media(base64Data: String, fileName: String, mimeType: String, title: String, text: String): Boolean {
        return try {
            val cleanBase64 = if (base64Data.contains(",")) {
                base64Data.substringAfter(",")
            } else {
                base64Data
            }
            val bytes = Base64.decode(cleanBase64, Base64.DEFAULT)

            // Save to shared cache directory
            val cacheDir = File(context.cacheDir, "shared_media")
            cacheDir.mkdirs()
            val tempFile = File(cacheDir, fileName)
            FileOutputStream(tempFile).use { fos ->
                fos.write(bytes)
                fos.flush()
            }

            val fileUri = FileProvider.getUriForFile(
                context,
                "com.example.everythingapp.fileprovider",
                tempFile
            )

            val shareIntent = Intent(Intent.ACTION_SEND).apply {
                type = mimeType
                putExtra(Intent.EXTRA_STREAM, fileUri)
                putExtra(Intent.EXTRA_TITLE, title)
                putExtra(Intent.EXTRA_SUBJECT, title)
                putExtra(Intent.EXTRA_TEXT, text)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            val chooser = Intent.createChooser(shareIntent, "Share via WhatsApp, Instagram, Telegram...").apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(chooser)
            true
        } catch (e: Exception) {
            Log.e("AndroidNativeBridge", "Native share failed", e)
            (context as? ComponentActivity)?.runOnUiThread {
                Toast.makeText(context, "Share error: ${e.localizedMessage}", Toast.LENGTH_SHORT).show()
            }
            false
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun AppWebView(
    modifier: Modifier = Modifier,
    onWebViewCreated: (WebView) -> Unit
) {
    AndroidView(
        modifier = modifier,
        factory = { context ->
            val assetLoader = WebViewAssetLoader.Builder()
                .setDomain("appassets.androidplatform.net")
                .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
                .build()

            WebView(context).apply {
                layoutParams = ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
                setBackgroundColor(Color.parseColor("#0f1218"))

                settings.apply {
                    javaScriptEnabled = true
                    domStorageEnabled = true
                    allowFileAccess = true
                    allowContentAccess = true
                    loadWithOverviewMode = true
                    useWideViewPort = true
                    setSupportZoom(false)
                    builtInZoomControls = false
                    displayZoomControls = false
                    cacheMode = WebSettings.LOAD_DEFAULT
                    mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                    setGeolocationEnabled(true)
                    mediaPlaybackRequiresUserGesture = false
                }

                addJavascriptInterface(AndroidNativeBridge(context), "AndroidBridge")

                webChromeClient = object : WebChromeClient() {
                    override fun onGeolocationPermissionsShowPrompt(
                        origin: String?,
                        callback: GeolocationPermissions.Callback?
                    ) {
                        callback?.invoke(origin, true, false)
                    }

                    override fun onConsoleMessage(consoleMessage: ConsoleMessage?): Boolean {
                        Log.d(
                            "EverythingAppWeb",
                            "${consoleMessage?.message()} -- From line ${consoleMessage?.lineNumber()} of ${consoleMessage?.sourceId()}"
                        )
                        return true
                    }
                }

                webViewClient = object : WebViewClient() {
                    override fun shouldInterceptRequest(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): WebResourceResponse? {
                        val uri = request?.url ?: return null
                        val urlStr = uri.toString()

                        if (urlStr.startsWith("https://appassets.androidplatform.net/") || urlStr.startsWith("http://localhost/")) {
                            val rawPath = uri.path?.trimStart('/') ?: return null
                            val cleanPath = try {
                                java.net.URLDecoder.decode(rawPath, "UTF-8")
                            } catch (_: Exception) {
                                rawPath
                            }

                            val stripped = cleanPath.removePrefix("assets/").removePrefix("web/")

                            val candidatePaths = listOf(
                                cleanPath,
                                "web/$cleanPath",
                                "web/$stripped",
                                stripped,
                                "web/assets/$stripped",
                                "assets/$stripped",
                                "web/playbook/$stripped",
                                "web/Yellow Dude/$stripped",
                                "web/ai-gallery/$stripped"
                            )

                            for (candidate in candidatePaths) {
                                try {
                                    val stream = context.assets.open(candidate)
                                    val mimeType = when {
                                        candidate.endsWith(".html", ignoreCase = true) -> "text/html"
                                        candidate.endsWith(".js", ignoreCase = true) -> "application/javascript"
                                        candidate.endsWith(".css", ignoreCase = true) -> "text/css"
                                        candidate.endsWith(".png", ignoreCase = true) -> "image/png"
                                        candidate.endsWith(".jpg", ignoreCase = true) || candidate.endsWith(".jpeg", ignoreCase = true) -> "image/jpeg"
                                        candidate.endsWith(".webp", ignoreCase = true) -> "image/webp"
                                        candidate.endsWith(".svg", ignoreCase = true) -> "image/svg+xml"
                                        candidate.endsWith(".woff", ignoreCase = true) -> "font/woff"
                                        candidate.endsWith(".woff2", ignoreCase = true) -> "font/woff2"
                                        candidate.endsWith(".ttf", ignoreCase = true) -> "font/ttf"
                                        candidate.endsWith(".mp4", ignoreCase = true) -> "video/mp4"
                                        candidate.endsWith(".webm", ignoreCase = true) -> "video/webm"
                                        candidate.endsWith(".json", ignoreCase = true) -> "application/json"
                                        candidate.endsWith(".pdf", ignoreCase = true) -> "application/pdf"
                                        else -> "application/octet-stream"
                                    }
                                    val headers = mapOf(
                                        "Access-Control-Allow-Origin" to "*",
                                        "Access-Control-Allow-Methods" to "GET, POST, OPTIONS",
                                        "Access-Control-Allow-Headers" to "*"
                                    )
                                    return WebResourceResponse(mimeType, "UTF-8", 200, "OK", headers, stream)
                                } catch (_: Exception) {
                                    // Try next candidate
                                }
                            }
                        }

                        return assetLoader.shouldInterceptRequest(uri)
                    }

                    override fun shouldOverrideUrlLoading(
                        view: WebView?,
                        request: WebResourceRequest?
                    ): Boolean {
                        val url = request?.url?.toString() ?: ""
                        if (url.startsWith("https://appassets.androidplatform.net/")) {
                            return false
                        }
                        return false
                    }

                    override fun onReceivedError(
                        view: WebView?,
                        request: WebResourceRequest?,
                        error: WebResourceError?
                    ) {
                        Log.e(
                            "EverythingAppWeb",
                            "WebView Error: ${error?.description} for ${request?.url}"
                        )
                    }
                }

                loadUrl("https://appassets.androidplatform.net/assets/web/index.html")
                onWebViewCreated(this)
            }
        }
    )
}

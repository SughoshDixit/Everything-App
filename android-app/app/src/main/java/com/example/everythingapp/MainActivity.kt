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
                .addPathHandler("/assets/web/", WebViewAssetLoader.AssetsPathHandler(context))
                .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
                .addPathHandler("/", WebViewAssetLoader.AssetsPathHandler(context))
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

                        // 1. Try standard WebViewAssetLoader
                        val assetResponse = assetLoader.shouldInterceptRequest(uri)
                        if (assetResponse != null) return assetResponse

                        // 2. Custom asset streamer for appassets.androidplatform.net or localhost
                        if (urlStr.startsWith("https://appassets.androidplatform.net/") || urlStr.startsWith("http://localhost/")) {
                            val rawPath = uri.path?.trimStart('/') ?: return null
                            val cleanPath = try {
                                java.net.URLDecoder.decode(rawPath, "UTF-8")
                            } catch (_: Exception) {
                                rawPath
                            }

                            // Look across all asset mirrors: web/$path, $path, web/assets/$path, web/playbook/$path, web/ai-gallery/$path
                            val candidatePaths = listOf(
                                "web/$cleanPath",
                                cleanPath,
                                "web/assets/$cleanPath",
                                "web/playbook/$cleanPath",
                                "web/ai-gallery/$cleanPath",
                                "web/Yellow Dude/$cleanPath"
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
                        return null
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

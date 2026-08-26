package com.example.everythingapp

import android.graphics.Color
import android.os.Bundle
import android.util.Log
import android.view.ViewGroup
import android.webkit.*
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.webkit.WebViewAssetLoader
import com.example.everythingapp.theme.EverythingAppTheme

class MainActivity : ComponentActivity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    enableEdgeToEdge()
    setContent {
      EverythingAppTheme { Surface(modifier = Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) { MainNavigation() } }
    }
  }

  private fun createWebView(context: android.content.Context): WebView {
    val assetLoader = WebViewAssetLoader.Builder()
        .setDomain("appassets.androidplatform.net")
        .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(context))
        .build()

    return WebView(context).apply {
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
        }
    }
  }
}

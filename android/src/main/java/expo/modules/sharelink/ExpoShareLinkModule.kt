package expo.modules.sharelink

import android.app.Activity
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.ClipData
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.Bundle
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.io.File
import java.net.URL

private const val REQUEST_CODE = 0x5348  // "SH"
private const val ACTION_CHOSEN = "expo.modules.sharelink.CHOSEN"

class ShareOptions : Record {
  @Field val url: String = ""
  @Field val title: String? = null
  @Field val iconUri: String? = null
  @Field val dialogTitle: String? = null
}

class InvalidUrlException(url: String) :
  CodedException("ERR_SHARE_LINK_URL", "'$url' is not a valid URL", null)

class ExpoShareLinkModule : Module() {
  private var pendingPromise: Promise? = null
  private var receiver: BroadcastReceiver? = null

  private val context: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  override fun definition() = ModuleDefinition {
    Name("ExpoShareLink")

    Function("isAvailable") { true }

    AsyncFunction("shareAsync") { options: ShareOptions, promise: Promise ->
      if (options.url.isBlank() || Uri.parse(options.url).scheme.isNullOrEmpty()) {
        throw InvalidUrlException(options.url)
      }
      val activity = appContext.currentActivity ?: throw Exceptions.MissingActivity()

      val send = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_TEXT, options.url)
        options.title?.let {
          putExtra(Intent.EXTRA_TITLE, it)
          putExtra(Intent.EXTRA_SUBJECT, it)
        }
      }
      previewUri(options.iconUri)?.let { uri ->
        send.clipData = ClipData.newUri(context.contentResolver, options.title ?: "", uri)
        send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
      }

      pendingPromise?.resolve(result(false, null))
      pendingPromise = promise
      registerChosenReceiver()

      val chooser = Intent.createChooser(send, options.dialogTitle, chosenSender())
      activity.runOnUiThread {
        activity.startActivityForResult(chooser, REQUEST_CODE)
      }
    }

    // The chooser closing without a pick never fires the chosen-component
    // broadcast, so the activity result is what settles a dismissal.
    OnActivityResult { _, payload ->
      if (payload.requestCode != REQUEST_CODE) return@OnActivityResult
      pendingPromise?.resolve(result(false, null))
      pendingPromise = null
      unregisterChosenReceiver()
    }

    OnDestroy {
      unregisterChosenReceiver()
    }
  }

  private fun result(completed: Boolean, activityType: String?) = Bundle().apply {
    putBoolean("completed", completed)
    putString("activityType", activityType)
  }

  private fun chosenSender() =
    PendingIntent.getBroadcast(
      context,
      REQUEST_CODE,
      Intent(ACTION_CHOSEN).setPackage(context.packageName),
      PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_MUTABLE
    ).intentSender

  private fun registerChosenReceiver() {
    if (receiver != null) return
    val chosen = object : BroadcastReceiver() {
      override fun onReceive(ctx: Context, intent: Intent) {
        val component = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
          intent.getParcelableExtra(Intent.EXTRA_CHOSEN_COMPONENT, ComponentName::class.java)
        } else {
          @Suppress("DEPRECATION")
          intent.getParcelableExtra(Intent.EXTRA_CHOSEN_COMPONENT)
        }
        pendingPromise?.resolve(result(true, component?.flattenToString()))
        pendingPromise = null
        unregisterChosenReceiver()
      }
    }
    ContextCompat.registerReceiver(
      context,
      chosen,
      IntentFilter(ACTION_CHOSEN),
      ContextCompat.RECEIVER_NOT_EXPORTED
    )
    receiver = chosen
  }

  private fun unregisterChosenReceiver() {
    receiver?.let { runCatching { context.unregisterReceiver(it) } }
    receiver = null
  }

  // Copies the icon into a cache folder the FileProvider exposes, so the
  // sharesheet can read it as a content:// URI.
  private fun previewUri(iconUri: String?): Uri? {
    if (iconUri.isNullOrBlank()) return null
    val dir = File(context.cacheDir, "expo-share-link").apply { mkdirs() }
    val target = File(dir, "preview.png")
    val copied = runCatching {
      val source = Uri.parse(iconUri)
      when (source.scheme) {
        "http", "https" -> URL(iconUri).openStream().use { it.copyTo(target.outputStream()) }
        "file", null -> File(source.path ?: iconUri).inputStream().use { it.copyTo(target.outputStream()) }
        "content" -> context.contentResolver.openInputStream(source)?.use { it.copyTo(target.outputStream()) }
        else -> return null
      }
    }.isSuccess
    if (!copied) return null
    return FileProvider.getUriForFile(
      context,
      "${context.packageName}.ExpoShareLinkFileProvider",
      target
    )
  }
}

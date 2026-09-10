package expo.modules.sharelink

import androidx.core.content.FileProvider

// A dedicated subclass so the module's authority never collides with a
// FileProvider the host app or another library declares.
class ShareLinkFileProvider : FileProvider()

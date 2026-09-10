# Changelog

## Unpublished

### 🛠 Breaking changes

### 🎉 New features

### 🐛 Bug fixes

### 💡 Others

## 0.1.0

### 🎉 New features

- Initial release: `shareLink({ url, title, icon, dialogTitle })` and `isAvailable()`.
- iOS: `UIActivityViewController` with `LPLinkMetadata`, so the sheet header shows your title and icon instead of the generic link placeholder.
- Android: system sharesheet with `EXTRA_TITLE` and a preview thumbnail served through a scoped `FileProvider`; reports the chosen app when the OS provides it.
- Web: Web Share API with a `completed: false` result when the user cancels.

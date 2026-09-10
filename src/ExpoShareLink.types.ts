/** A bundled image (`require('./icon.png')`) or an object with a `file://` or `https://` URI. */
export type ShareLinkIcon = number | { uri: string };

export interface ShareLinkOptions {
  /** The link to share. */
  url: string;
  /**
   * Shown in bold above the link in the iOS share sheet header, used as the
   * Android sharesheet preview title, and passed to the Web Share API.
   */
  title?: string;
  /**
   * Image shown next to the title in the iOS share sheet header and as the
   * Android sharesheet preview thumbnail. Ignored on web.
   */
  icon?: ShareLinkIcon;
  /** Title of the Android chooser dialog. Ignored elsewhere. */
  dialogTitle?: string;
}

export interface ShareLinkResult {
  /**
   * `true` when the user picked a target. On Android it is `true` when the
   * chooser could report the chosen app, `false` when it was dismissed.
   */
  completed: boolean;
  /**
   * The activity the user picked, when the platform reports it: a
   * `UIActivity.ActivityType` on iOS or a flattened `ComponentName` on Android.
   */
  activityType: string | null;
}

/** @internal Options after the icon has been resolved to a URI the native side can load. */
export interface NativeShareOptions {
  url: string;
  title?: string;
  iconUri?: string;
  dialogTitle?: string;
}

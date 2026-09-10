import { CodedError } from 'expo-modules-core';

import type { ShareLinkOptions, ShareLinkResult } from './ExpoShareLink.types';
import ExpoShareLinkModule from './ExpoShareLinkModule';
import { resolveIconUri } from './resolveIcon';

export * from './ExpoShareLink.types';

/**
 * Opens the platform share sheet for a link, with a title and icon in the
 * sheet's header instead of the generic "link" placeholder.
 */
export async function shareLink(options: ShareLinkOptions): Promise<ShareLinkResult> {
  if (!options || typeof options.url !== 'string' || options.url.length === 0) {
    throw new CodedError('ERR_SHARE_LINK_URL', '`shareLink` needs a non-empty `url`.');
  }
  const iconUri = await resolveIconUri(options.icon);
  return ExpoShareLinkModule.shareAsync({
    url: options.url,
    title: options.title,
    iconUri,
    dialogTitle: options.dialogTitle,
  });
}

/** `true` on iOS and Android; on web, `true` only where the Web Share API exists. */
export function isAvailable(): boolean {
  return ExpoShareLinkModule.isAvailable();
}

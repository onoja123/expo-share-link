import { Asset } from 'expo-asset';

import type { ShareLinkIcon } from './ExpoShareLink.types';

/** Turns a `require()`d image into a local file URI; passes URI objects through. */
export async function resolveIconUri(icon?: ShareLinkIcon): Promise<string | undefined> {
  if (icon == null) return undefined;
  if (typeof icon === 'number') {
    const asset = Asset.fromModule(icon);
    await asset.downloadAsync();
    return asset.localUri ?? asset.uri;
  }
  return icon.uri || undefined;
}

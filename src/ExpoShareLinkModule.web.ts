import { NativeModule, registerWebModule } from 'expo';
import { CodedError } from 'expo-modules-core';

import type { NativeShareOptions, ShareLinkResult } from './ExpoShareLink.types';

class ExpoShareLinkModule extends NativeModule<Record<string, never>> {
  isAvailable(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  }

  async shareAsync(options: NativeShareOptions): Promise<ShareLinkResult> {
    if (!this.isAvailable()) {
      throw new CodedError(
        'ERR_SHARE_LINK_UNAVAILABLE',
        'The Web Share API is not available in this browser.'
      );
    }
    try {
      await navigator.share({ url: options.url, title: options.title });
      return { completed: true, activityType: null };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { completed: false, activityType: null };
      }
      throw error;
    }
  }
}

export default registerWebModule(ExpoShareLinkModule, 'ExpoShareLinkModule');

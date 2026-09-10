import { NativeModule, requireNativeModule } from 'expo';

import type { NativeShareOptions, ShareLinkResult } from './ExpoShareLink.types';

declare class ExpoShareLinkModule extends NativeModule<Record<string, never>> {
  isAvailable(): boolean;
  shareAsync(options: NativeShareOptions): Promise<ShareLinkResult>;
}

export default requireNativeModule<ExpoShareLinkModule>('ExpoShareLink');

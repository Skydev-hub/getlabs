import { OverlayRef } from '@angular/cdk/overlay';

export class LightboxRef {
  constructor(private overlayRef: OverlayRef) {}

  close(): void {
    this.overlayRef.dispose();
  }
}

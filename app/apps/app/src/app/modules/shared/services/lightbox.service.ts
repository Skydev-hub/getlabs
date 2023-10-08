import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, DomPortalOutlet, PortalInjector } from '@angular/cdk/portal';
import { Injectable, Injector } from '@angular/core';
import { File } from '@app/ui';
import { LightboxRef } from '../components/lightbox/lightbox-ref';
import { LightboxComponent } from '../components/lightbox/lightbox.component';
import { LIGHTBOX_FILE } from '../components/lightbox/lightbox.tokens';

@Injectable({
  providedIn: 'root'
})
export class LightboxService {

  private readonly portal: ComponentPortal<LightboxComponent>;

  private readonly host: DomPortalOutlet;

  constructor(
    private overlay: Overlay,
    private injector: Injector,
  ) { }

  open(file: File, config?: OverlayConfig): LightboxRef {
    const overlayRef = this.overlay.create({
      scrollStrategy: this.overlay.scrollStrategies.block(),
      height: '100%',
      width: '100%',
      ...config,
    });

    const lightboxRef = new LightboxRef(overlayRef);

    this.attach(overlayRef, file, lightboxRef);

    return lightboxRef;
  }

  private attach(overlayRef: OverlayRef, file: File, lightboxRef: LightboxRef): LightboxComponent {
    const injector = this.createInjector(file, lightboxRef);

    const portal = new ComponentPortal(LightboxComponent, null, injector);
    const ref = overlayRef.attach(portal);

    return ref.instance;
  }

  private createInjector(file: File, ref: LightboxRef): PortalInjector {
    const tokens = new WeakMap();

    tokens.set(LightboxRef, ref);
    tokens.set(LIGHTBOX_FILE, file);

    return new PortalInjector(this.injector, tokens);
  }
}

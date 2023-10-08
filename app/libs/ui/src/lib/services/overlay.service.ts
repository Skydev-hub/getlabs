import { Overlay, OverlayConfig, OverlayRef } from "@angular/cdk/overlay";
import { ComponentPortal, PortalInjector } from "@angular/cdk/portal";
import { Injectable, Injector } from "@angular/core";

interface OverlayConfigExtras {
  closeOnBackdropClick: boolean,
}

@Injectable({
  providedIn: "root"
})
export class OverlayService {

  constructor(
    private overlay: Overlay,
    private injector: Injector
  ) { }

  open(component: any, config?: OverlayConfig & OverlayConfigExtras) {
    const ref = this.overlay.create({
      positionStrategy: this.overlay.position().global(),
      scrollStrategy: this.overlay.scrollStrategies.block(),
      height: "100%",
      width: "100%",
      hasBackdrop: true,
      ...config
    });

    this.attach(ref, component);

    if (config.closeOnBackdropClick) {
      ref.backdropClick().subscribe(() => ref.dispose());
    }
  }

  private attach(ref: OverlayRef, component: any) {
    const injector = this.createInjector(ref);

    const portal = new ComponentPortal(component, null, injector);

    ref.attach(portal);
  }

  private createInjector(ref: OverlayRef): PortalInjector {
    const tokens = new WeakMap();

    tokens.set(OverlayRef, ref);

    return new PortalInjector(this.injector, tokens);
  }

}

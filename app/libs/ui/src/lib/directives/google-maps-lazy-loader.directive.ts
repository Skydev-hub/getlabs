import { Directive, Input, OnInit, Type } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { LazyLoaderDirective } from './lazy-loader.directive';

/**
 * Convenience wrapper directive around LazyLoaderDirective, which automatically handles the lazy loading of the google maps
 * API without requiring consuming modules to directly indicate the target component.
 *
 * Should be added directly to consuming google-map component instances.
 */
@Directive({
  selector: '[appGoogleMapsLazyLoader]'
})
export class GoogleMapsLazyLoaderDirective extends LazyLoaderDirective<GoogleMap> implements OnInit {
  @Input('appLazyLoader')
  public set component(component: Type<any>) {
    // Deliberately empty to prevent consumers from supplying a component value for what should be a fixed property.
  }

  public get component() {
    return super.component;
  }

  ngOnInit(): void {
    /* Set the component type to be GoogleMap */
    super.component = GoogleMap;

    /* Invoke the parent onInit */
    super.ngOnInit();
  }
}

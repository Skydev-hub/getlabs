import { Injectable } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { Observable } from 'rxjs';
import { LazyLoader, LazyLoaderHandler } from '../directives/lazy-loader.directive';
import { GoogleMapService } from '../services/google-map.service';

@Injectable()
@LazyLoader(GoogleMap)
export class GoogleMapsLoader implements LazyLoaderHandler {
  constructor(private readonly googleMapService: GoogleMapService) { }

  load(): Observable<boolean> {
    return this.googleMapService.init();
  }
}

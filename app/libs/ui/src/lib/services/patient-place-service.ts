import { Injectable } from '@angular/core';
import { PlaceDetailsResult } from '@google/maps';
import { CookieService } from 'ngx-cookie';
import { Address } from '../models/user';
import { ConfigurationService } from '../services/configuration.service';
import { PlacesService } from '../services/places.service';
import { Observable, of } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { addMinutes } from "date-fns";

export const PATIENT_LOCATION_COOKIE_KEY = 'GlPatientLocation';

export interface PatientLocation {
  place: PlaceDetailsResult;
  unit?: string;
}

export interface PatientLocationCookie {
  place_id: string;
  unit?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PatientPlaceService {
  placeId: string;
  location: PatientLocation = {
    place: null,
    unit: null
  };

  constructor(private readonly cookieService: CookieService, private readonly config: ConfigurationService, private readonly placesService: PlacesService) {}

  set(place: PlaceDetailsResult | string | null, unit: string = null) {
    if (!place) {
      this.placeId = undefined;
      this.location.place = null;
    } else if (typeof place === 'string') {
      this.placeId = place;
      // If new place id remove the saved place so a new one is requested on next get
      if (this.location && this.location.place && place !== this.location.place.place_id) {
        this.location.place = null;
      }
    } else {
      this.location.place = place;
      this.placeId = place.place_id;
    }
    this.location.unit = unit;
    this.updateCookie();
  }

  get(): Observable<PatientLocation | null> {
    if (this.location.place) {
      return of(this.location);
    }
    return this.fetchFromCookie();
  }

  getAsAddress(): Observable<Address | null> {
    return this.get().pipe(
      map(result => result ? this.placesService.placeToAddress(result.place, result.unit) : null)
    );
  }

  fetchFromCookie(): Observable<PatientLocation | null> {
    const location = this.cookieService.getObject(PATIENT_LOCATION_COOKIE_KEY) as PatientLocationCookie;
    if (!location || !location.place_id) {
      return of(null);
    }
    return this.placesService.place(location.place_id).pipe(
      map(result => ({ place: result, unit: location.unit })),
      tap(result => this.location = result)
    );
  }

  updateCookie() {
    if (this.placeId) {
      this.cookieService.putObject(
        PATIENT_LOCATION_COOKIE_KEY,
        <PatientLocationCookie>{
          place_id: this.placeId,
          unit: this.location ? this.location.unit : null,
        },
        {
          domain: this.config.getCookieDomain(),
          expires: addMinutes(new Date(), 30),
        }
      );
    } else {
      this.cookieService.remove(PATIENT_LOCATION_COOKIE_KEY);
    }
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AddressType, PlaceDetailsAddressComponentType, PlaceAutocompleteResult, PlaceAutocompleteType, PlaceDetailsResult } from '@google/maps';
import { Observable } from 'rxjs';
import { Address, Countries } from '../models';
import { filterFalsy } from '../utils/http.utils';
import { secureid } from '../utils/string.utils';
import { ConfigurationService } from './configuration.service';

export enum PlaceAutocompleteTypes {
  geocode = 'geocode',
  address = 'address',
  establishment = 'establishment',
  regions = '(regions)',
  cities = '(cities)'
}

interface PlacesExtras {
  country?: Countries;
  lat?: number;
  lng?: number;
  radius?: number;
  types?: PlaceAutocompleteType;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private readonly sessionToken: string;

  constructor(private readonly http: HttpClient, private readonly config: ConfigurationService) {
    this.sessionToken = secureid();
  }

  autocomplete(query: string, extras?: PlacesExtras): Observable<PlaceAutocompleteResult[]> {
    if (extras && extras.lat && extras.lng && !extras.radius) {
      extras.radius = 20000;
    }
    return this.http.get<PlaceAutocompleteResult[]>(this.config.getApiEndPoint('place/autocomplete'), {
      params: {
        sessionToken: this.sessionToken,
        query,
        ...filterFalsy(extras)
      }
    });
  }

  place(id: string): Observable<PlaceDetailsResult> {
    return this.http.get<PlaceDetailsResult>(this.config.getApiEndPoint(`place/${id}/details`), {
      params: {
        sessionToken: this.sessionToken
      }
    });
  }

  placeToAddress(place: PlaceDetailsResult, unit: string = null, address: Address = null) {
    address = address || new Address();
    address.street = `${this.getPlaceAddressComponent(place, 'street_number') || ''} ${this.getPlaceAddressComponent(place, 'route') || ''}`.trim();
    address.city = this.getPlaceAddressComponent(place, 'locality');
    address.state = this.getPlaceAddressComponent(place, 'administrative_area_level_1');
    address.zipCode = this.getPlaceAddressComponent(place, 'postal_code');
    address.unit = unit || this.getPlaceAddressComponent(place, 'subpremise');
    return address;
  }

  getPlaceAddressComponent(place: PlaceDetailsResult, type: AddressType | PlaceDetailsAddressComponentType) {
    const component = place.address_components.find(v => v.types.includes(type));
    if (!component) {
      return null;
    }
    return component.short_name || component.long_name;
  }
}

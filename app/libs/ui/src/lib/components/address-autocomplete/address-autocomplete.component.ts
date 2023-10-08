import { Component, forwardRef, Input, OnInit, ViewChild } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { Address } from '../../models/user';
import { PlaceAutocompleteResult, PlaceAutocompleteType, PlaceDetailsResult } from '@google/maps';
import { Position } from 'geojson';
import { Observable, of, Subject } from 'rxjs';
import { catchError, debounceTime, switchMap } from 'rxjs/operators';
import { Countries } from '../../models/places-autocomplete.dto';
import { PlaceAutocompleteTypes, PlacesService } from '../../services/places.service';
import { Markets } from '../../utils/markets.utils';
import { emit } from "cluster";

/**
 * AddressAutocompleteComponent is a generic component that providing autocomplete functionality for an address field.
 * This component interfaces with the Google Places Autocomplete API to provide suggestions for the entered query.
 * Note that users are required to select a result from the autocomplete suggest box; otherwise, the control
 * will report its value as invalid.
 */
@Component({
  selector: 'app-address-autocomplete',
  templateUrl: './address-autocomplete.component.html',
  styleUrls: ['./address-autocomplete.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AddressAutocompleteComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AddressAutocompleteComponent),
      multi: true
    }
  ]
})
export class AddressAutocompleteComponent implements OnInit, ControlValueAccessor, Validator {
  @Input()
  country: Countries = Countries.UNITED_STATES;

  @Input()
  market: Position;

  @Input()
  placeholder: string = 'Home address';

  @Input()
  placeType: PlaceAutocompleteType = PlaceAutocompleteTypes.address;

  // Used to specify the company name in front of the address being typed in
  @Input()
  searchPrefix: string;

  @ViewChild(MatAutocompleteTrigger, { static: true })
  matAutocompleteTrigger: MatAutocompleteTrigger;

  @Input()
  autoFocusInput: boolean = false;

  input: FormControl;

  autocompleteSubject = new Subject<PlaceAutocompleteResult[]>();

  autocomplete$: Observable<PlaceAutocompleteResult[]>;

  onTouched: () => void;

  constructor(private readonly places: PlacesService) {
    this.input = new FormControl();
  }

  public ngOnInit(): void {
    /* Plug the autocomplete observable into the result of the autocompleteSubject... */
    this.autocomplete$ = this.autocompleteSubject.asObservable().pipe(
      switchMap((address: any) => {
        /* Extract the address from the provided accessor. */
        let addressQuery = typeof address === 'string' ? address : (address && address.description) || null;
        if (this.searchPrefix) {
          addressQuery = `${this.searchPrefix} ${addressQuery}`;
        }
        const latLng = this.market
          ? {
              lat: this.market[0],
              lng: this.market[1]
            }
          : {};
        /* We only want to perform the query if the address description is at least 4 characters in length. */
        return typeof addressQuery === 'string' && addressQuery.length > 3
          ? this.places
              .autocomplete(addressQuery, {
                country: this.country,
                types: this.placeType,
                ...latLng
              })
              .pipe(
                catchError(() => {
                  return of(null);
                })
              )
          : of(null);
      })
    );

    /* The subscription tied into the input field must wait before informing the autocomplete subject. */
    this.input.valueChanges.pipe(debounceTime(300)).subscribe(value => this.autocompleteSubject.next(value));
  }

  /**
   * Determines if a valid autocomplete-suggested address is selected.
   */
  public isAddressSelected() {
    return this.isValidAddress(this.input.value);
  }

  /**
   * Returns a human-readable version of the address represented by the supplied param.
   */
  public getSelectedAddressText(result: PlaceAutocompleteResult) {
    return (result && result.description) || '';
  }

  /**
   * Applies the supplied PlaceAutocompleteResult or Address object as the currently-selected address. If an
   * Address object is supplied, this value will perform basic transformation such that it is recognized
   * as a valid address value.
   */
  public writeValue(value: (PlaceAutocompleteResult & PlaceDetailsResult) | Address): void {
    let result: PlaceAutocompleteResult = value as PlaceAutocompleteResult;

    /* If an address value is supplied to us, we will need to translate it accordingly. */
    if (value instanceof Address) {
      result =
        (value.street && value.street.trim()) || (value.zipCode && value.zipCode.trim())
          ? {
              place_id: null,
              description: [value.street, value.city, value.state, value.zipCode].filter(e => !!e).join(', '),
              terms: null,
              types: null,
              matched_substrings: null,
              structured_formatting: null
            }
          : null;

      /* If PlaceDetailsResult, format as PlaceAutocompleteResult */
    } else if (value && value.place_id && value.formatted_address) {
      result = {
        place_id: value.place_id,
        description: value.formatted_address,
        terms: null,
        types: value.types,
        matched_substrings: null,
        structured_formatting: null
      };
    }

    this.input.setValue(result, { emitEvent: false });
  }

  public registerOnChange(fn: any): void {
    this.input.valueChanges.subscribe((value) => {
      /* Only cascade a changed value if the value is a valid address via the google places API */
      fn(this.isValidAddress(value) ? value : null);
    });
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  public setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.input.disable();
    } else {
      this.input.enable();
    }
  }

  /**
   * Returns a validation error if the input field is presently of type string.
   */
  public validate(): ValidationErrors | null {
    return typeof this.input.value === 'string' ? { addressAutocomplete: true } : null;
  }

  /**
   * On blur, we validate the contents of the field -- if the field is a string, the value is invalid, and we will
   * clear the value of the field to make it more obvious that the user needs to select an autocomplete result.
   */
  public doBlur() {
    /* If the current value is a string, then reset the input field... */
    if (typeof this.input.value === 'string') {
      this.input.reset();
    }
  }

  /**
   * Determines if the supplied parameter represents a valid address object value.
   */
  private isValidAddress(value: any) {
    return !!(value && typeof value !== 'string');
  }
}

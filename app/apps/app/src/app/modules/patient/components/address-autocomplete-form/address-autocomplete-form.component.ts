import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientPlaceService } from '../../../../../../../../libs/ui/src/lib/services/patient-place-service';
import { Address, getFormFieldError, PatientUser } from '@app/ui';
import { cloneDeep } from 'lodash-es';
import { PlaceDetailsResult } from '@google/maps';

export interface AddressAutocompleteFormLocationUpdated {
  address: Address;
  place: PlaceDetailsResult;
}

@Component({
  selector: 'app-address-autocomplete-form',
  templateUrl: './address-autocomplete-form.component.html',
  styleUrls: ['./address-autocomplete-form.component.scss']
})
export class AddressAutocompleteFormComponent implements OnInit {
  @Output()
  locationUpdated = new EventEmitter<AddressAutocompleteFormLocationUpdated>();

  @Input()
  user: PatientUser;

  form: FormGroup;

  constructor(fb: FormBuilder, private readonly patientPlaceService: PatientPlaceService) {
    this.form = fb.group({
      place: [null, Validators.required],
      unit: ['', null]
    });
  }

  ngOnInit() {
    this.form.valueChanges.subscribe(this.onChange.bind(this));
    this.patientPlaceService.get().subscribe(result => {
      // if address saved in cookie start with that.
      // else if logged in user with saved address start with that
      if (result) {
        this.form.setValue(result);
      } else if (this.user && this.user.address) {
        this.form.setValue({
          place: cloneDeep(this.user.address), // clone the address as to not change the user object
          unit: this.user.address.unit
        });
      } else {
        this.locationUpdated.emit({ address: null, place: null });
      }
    });
  }

  getError(fieldName: string, form?: AbstractControl): string {
    // Only show a place error if the place selected is missing a zip code, required errors are not necessary
    if (fieldName === 'place' && !this.form.get(fieldName).hasError('placeNoZipCode')) {
      return null;
    }
    return getFormFieldError(form ? (form as FormGroup) : this.form, fieldName);
  }

  validateHasZipCode(address: Address): boolean {
    if (address.zipCode) {
      return true;
    }
    this.form.get('place').setErrors({
      placeNoZipCode: true
    });
    this.form.get('place').markAsTouched();
    return false;
  }

  onChange() {
    const payload: AddressAutocompleteFormLocationUpdated = { address: null, place: null };
    if (this.form.valid) {
      const place = this.form.get('place').value;
      const unit = this.form.get('unit').value;
      // If the field value is still an Address google's api was not used and we can emit that address
      if (place instanceof Address) {
        if (this.validateHasZipCode(place)) {
          place.unit = unit;
          payload.address = place;
        }
        this.locationUpdated.emit(payload);
      } else {
        this.patientPlaceService.set(place.place_id, unit);
        this.patientPlaceService.getAsAddress().subscribe(address => {
          if (this.validateHasZipCode(address)) {
            payload.address = address;
            payload.place = place;
          }
          this.locationUpdated.emit(payload);
        });
      }
    } else {
      this.locationUpdated.emit(payload);
    }
  }
}

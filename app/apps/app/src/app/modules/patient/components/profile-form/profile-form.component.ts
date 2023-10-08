import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Address,
  applyNetworkValidationErrors,
  AuthService,
  compareEntities,
  FormContainerDirective,
  FormFieldShape,
  FormInputMaskTypes,
  FormSectionShape,
  FormSectionVisibility,
  FormSectionVisibilityType,
  FormShape,
  getFormFieldError,
  markFormAsTouched,
  MaskValidatorService,
  PatientUser,
  PatientUserService,
  PlacesService,
} from '@app/ui';
import { AddressType, GeocodingAddressComponentType, PlaceDetailsAddressComponentType } from '@google/maps';
import { BehaviorSubject, Observable, of, Subscription } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { DeepPartial } from 'ts-essentials';
import { RadioButtonStyle } from '../../../shared/components/form/input/radio-input/radio-input.component';
import { coerceToUtc, DateGranularity } from '../../../shared/utils/date.utils';
import { AgeValidator } from '../../../shared/validators/age.validator';
import { RegexValidator } from '../../../shared/validators/regex.validator';
import { MinDateValidator } from '../../../shared/validators/min-date.validator';
import { MatDialog } from '@angular/material/dialog';
import { ProfileGuardianDialogComponent, ProfileGuardianDialogData } from '../profile-guardian-dialog/profile-guardian-dialog.component';

/**
 * Function type for the submitHandler input binding; this function should return an observable that emits
 * a raw PatientUser deep partial once the consumer is ready to proceed with save/update ops.
 * It also includes two observables as parameters to be (optionally) subscribed by the user, which
 * indicate the success/failure of the ultimate CRUD operation.
 */
export type OnSubmitHandler = (
  userObj: DeepPartial<PatientUser>,
  onSave$: Observable<PatientUser>,
  onError$: Observable<HttpErrorResponse>
) => Observable<DeepPartial<PatientUser>> | null;

export enum ProfileSection {
  Contact = 'contact',
  Address = 'address',
  AdditionalNotes = 'additionalNotes',
}

export interface ProfileSectionVisibility extends FormSectionVisibility {
  [ProfileSection.Contact]: FormSectionVisibilityType;
  [ProfileSection.Address]: FormSectionVisibilityType;
  [ProfileSection.AdditionalNotes]: FormSectionVisibilityType;
}

interface PlacesElementModelMapping {
  placesKey?: AddressType | GeocodingAddressComponentType | PlaceDetailsAddressComponentType;
  getValue?: (placeElementValue: string, formValue: any) => any;
}

interface AddressFormFieldShape extends FormFieldShape {
  placesMapping?: PlacesElementModelMapping | PlacesElementModelMapping[] | AddressType | GeocodingAddressComponentType;
}

interface AddressSectionShape extends FormSectionShape {
  [key: string]: AddressFormFieldShape;
}

interface ProfileFormShape extends FormShape {
  [ProfileSection.Contact]: FormSectionShape;
  [ProfileSection.Address]: AddressSectionShape;
  [ProfileSection.AdditionalNotes]: FormSectionShape;
}

const ALL_SECTIONS_FULLY_VISIBLE: ProfileSectionVisibility = {
  [ProfileSection.Contact]: FormSectionVisibilityType.Full,
  [ProfileSection.Address]: FormSectionVisibilityType.Full,
  [ProfileSection.AdditionalNotes]: FormSectionVisibilityType.Full,
};

@Component({
  selector: 'app-patient-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss'],
})
export class ProfileFormComponent implements OnChanges {
  @Input()
  btnLabel = 'Save Changes';

  // TBD how this will be used
  @Input()
  user: PatientUser;

  @Input()
  contactLabel: string = 'Contact Information';

  @Input()
  submitHandler: OnSubmitHandler;

  // Allow a address for the user to be passed, for creating new users when we already know their address
  @Input()
  address: Address;

  @Input()
  public set sections(sections: ProfileSectionVisibility) {
    this._sections = sections;

    /* If the inbound sections config has address set to anything but short, we will need to disable validation for the
     * fullAddress field. */
    if (this.form) {
      this._setFullAddressState();
    }
  }

  public get sections() {
    return this._sections;
  }

  private _sections: ProfileSectionVisibility = ALL_SECTIONS_FULLY_VISIBLE;

  @ViewChild(FormContainerDirective, { static: true })
  public formContainer: FormContainerDirective;

  @Output()
  save = new EventEmitter<PatientUser>();

  /* eslint-disable-next-line @angular-eslint/no-output-native */
  @Output()
  error = new EventEmitter<HttpErrorResponse>();

  radioButtonStyles = RadioButtonStyle;

  form: FormGroup;

  req$: Subscription;

  // address: FormControl;

  ProfileSections = ProfileSection;
  //
  FormSectionVisibilityType = FormSectionVisibilityType;

  public phoneNumberMask = FormInputMaskTypes.phoneNumber;

  public formShape: ProfileFormShape = {
    [ProfileSection.Contact]: {
      firstName: { fieldDef: ['', Validators.required], visibility: FormSectionVisibilityType.Short },
      lastName: { fieldDef: ['', Validators.required], visibility: FormSectionVisibilityType.Short },
      dob: {
        fieldDef: ['', [Validators.required, AgeValidator(5, 'age5'), MinDateValidator(new Date('1900-01-01'), 'invalidDob')]],
        visibility: FormSectionVisibilityType.Short,
        /* Because of differences in UTC-to-timezone conversion, and rather unfortunate browser inflexibility, we need to create a new date
         * object seeded off of the integer value of the UTC TIME of the selected birth date.  Since the form val is specified in the user's
         * local timezone, we have to calculate the number of seconds since the ES Epoch to a UTC date with the same year/month/day as the
         * form value date.  Even though the new date object will still be dimmed to the user's timezone, it will have the correct integer
         * value that would indicate a UTC date on the same year/month/date values as specified by the form value.
         * Basically, we're just trying to preserve the selected year/month/date.
         * */
        export: (formVal) => {
          if (!formVal) {
            return null;
          }

          /* Throw an exception in the event we receive a non-date value */
          if (!(formVal instanceof Date)) {
            throw new Error(`Cannot export the dob field: Expected a Date object - received ${formVal} instead.`);
          }

          return coerceToUtc(formVal, DateGranularity.day);
        },
      } as FormFieldShape<Date>,
      email: { fieldDef: ['', [Validators.required, Validators.email]] },
      phoneNumber: {
        fieldDef: [
          '',
          [
            Validators.required,
            this.maskValidatorService.getConformsToMaskValidator(FormInputMaskTypes.phoneNumber, 'phoneNumber'),
            // ConformsToMaskValidator(FormInputMask.phoneNumber.getRegExp(), 'phoneNumber'),
          ],
        ],
        visibility: FormSectionVisibilityType.Short,
      },
      gender: { fieldDef: [null, Validators.required], visibility: FormSectionVisibilityType.Short },
    },
    [ProfileSection.Address]: {
      street: {
        fieldDef: ['', Validators.required],
        placesMapping: [
          { placesKey: 'route', getValue: (route, fv) => `${fv.street || ''}${route}` },
          { placesKey: 'street_number', getValue: (streetNumber, fv) => `${streetNumber} ${fv.street || ''}` },
        ],
      },
      city: { fieldDef: ['', Validators.required], placesMapping: 'locality' },
      state: { fieldDef: [null, Validators.required], placesMapping: 'administrative_area_level_1' },
      zipCode: { fieldDef: ['', [Validators.required, RegexValidator(/^\d{5}$/, 'zipCode')]], placesMapping: 'postal_code' },
      unit: { fieldDef: [''], visibility: FormSectionVisibilityType.Short },
      // Only displayed in short mode
      fullAddress: {
        fieldDef: ['', Validators.required],
        visibility: FormSectionVisibilityType.Short,
        transient: true,
        placesKey: null,
      },
    },
    [ProfileSection.AdditionalNotes]: {
      notes: { fieldDef: [] },
      priorIssues: { fieldDef: [] },
    },
  };

  private user$ = new BehaviorSubject<PatientUser>(null);

  constructor(
    private fb: FormBuilder,
    private service: PatientUserService,
    private auth: AuthService,
    public places: PlacesService,
    private readonly matDialog: MatDialog,
    private readonly maskValidatorService: MaskValidatorService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.user$.next(this.user);
  }

  initForm(form: FormGroup) {
    this.form = form;

    this._setFullAddressState();

    this.user$.subscribe((user) => {
      // TODO potentially manage this in the generic tier
      this.form.patchValue(
        (user &&
          Object.keys(this._sections).reduce((patchObj, sectionKey) => {
            /* In the case of address, the user object will already embed this data in a subobject. */
            if (sectionKey === ProfileSection.Address) {
              patchObj[sectionKey] = user[sectionKey];

              /* The address value may also need to be replicated to the 'fullAddress' property for the purposes of this form. */
              patchObj[sectionKey].fullAddress = this.sections[ProfileSection.Address] === FormSectionVisibilityType.Short ? user[sectionKey] : null;
            } else {
              /* For all other sections, we need to place their corresponding form shape properties into the appropriate sub-objects. */
              patchObj[sectionKey] = Object.keys(this.formShape[sectionKey]).reduce((sectionObj, sectionPropKey) => {
                sectionObj[sectionPropKey] = user[sectionPropKey];
                return sectionObj;
              }, {});
            }

            return patchObj;
          }, {})) ||
          {}
      );
    });
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  // TODO - much of this logic is to be exported to the generic tier
  async onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const toPlain = (formGroupShape, formValueObj, baseObj?) => {
        /* Go through each defined value on the shape of the supplied form group, and apply the
         * corresponding embedded form value properties to the supplied base object (or to
         * a new object, if no base object is supplied). */
        return Object.keys(formGroupShape).reduce((expObj, propKey) => {
          if (!formGroupShape[propKey].transient) {
            /* If the field shape indicates that an export function is available, use that. Otherwise, just do a straight assign of the
             * resulting value. */
            expObj[propKey] = formGroupShape[propKey].export ? formGroupShape[propKey].export(formValueObj[propKey]) : formValueObj[propKey];
          }

          return expObj;
        }, baseObj || {});
      };

      // const exported: DeepPartial<PatientUser> = Object.keys(this._sections).reduce((expObj, groupKey) => {
      const exported: DeepPartial<PatientUser> = {};

      // Default to the passed in address if set
      if (this.address) {
        exported.address = this.address;
      }

      for (const groupKey of Object.keys(this._sections)) {
        // const exported: DeepPartial<PatientUser> = Object.keys(this._sections).reduce((expObj, groupKey) => {
        let formValue = this.form.value[groupKey];

        /* If the value of this section is undefined/null, pass to the next section. */
        if (!formValue) {
          continue;
        }

        /* Address must be treated differently */
        if (groupKey === ProfileSection.Address) {
          /* Retrieve the address form, and set the individual form elements to the corresponding results from the
           * retrieved place.  Make sure we only go through this if the address region is dirty. */
          // TODO - stripping non-dirty members should really be a generic operation... no time for that now.
          if (formValue.fullAddress && this.form.get(ProfileSection.Address).dirty) {
            // TODO - this export (i.e. translation between autocomplete result -> places details result -> GL address)
            //  should be handled directly by the address-autocomplete component.
            formValue = await this.places
              .place(formValue.fullAddress.place_id)
              .pipe(
                map((place) => {
                  /* Iterate through each defined address field - for those that have a placesMapping config, we will need to perform
                   * the requisite mapping between the places model and the getlabs model. */
                  Object.keys(this.formShape[ProfileSection.Address]).forEach((fieldKey) => {
                    /* Extract the field's places mapping.  If it doesn't exist, we can skip to the next field. */
                    const fieldPlacesMapping = this.formShape[ProfileSection.Address][fieldKey].placesMapping;

                    if (!fieldPlacesMapping) {
                      return;
                    }

                    /* First, we must convert the places mappings to a consistent collection of PlaceElementModelMapping */
                    const placesMappings: PlacesElementModelMapping[] =
                      typeof fieldPlacesMapping === 'string'
                        ? [{ placesKey: fieldPlacesMapping as AddressType | GeocodingAddressComponentType }]
                        : !Array.isArray(fieldPlacesMapping)
                        ? [fieldPlacesMapping as PlacesElementModelMapping]
                        : fieldPlacesMapping;

                    /* Iterate through each places mapping for this field (usually, there will only be one) */
                    placesMappings.forEach((placesMapping) => {
                      /* Attempt to find the address_component element that maps to this field's place mapping.   */
                      const addressComponent = place.address_components.find((address_component) => {
                        return address_component.types.includes(placesMapping.placesKey as any);
                      });

                      /* If we find an address_component that corresponds with this field, we need to assign its corresponding
                       * short_name (or long_name if short_name is not present) to the form. */
                      if (addressComponent) {
                        const v = addressComponent.short_name || addressComponent.long_name;

                        formValue[fieldKey] = placesMapping.getValue ? placesMapping.getValue(v, formValue) : v;
                      }
                    });
                  });

                  return formValue;
                })
              )
              .toPromise();
          }

          exported[groupKey] = toPlain(this.formShape[groupKey], formValue);
        } else {
          /* Otherwise, the other sub-form objects can be flattened onto the exported object. */
          toPlain(this.formShape[groupKey], formValue, exported);
        }
      }

      /* Shows the minor dialog to collect guardian info. If not a minor passes the data through. */
      this.minorGuardianDialog(exported).subscribe((data) => {
        /* If a callback is supplied, invoke that now with the user object.  We will first perform the function of the
         * callback before we do anything else... */
        this.req$ = (this.submitHandler ? this.submitHandler(data, this.save.asObservable(), this.error.asObservable()) : of(data))
          .pipe(
            flatMap((user) => {
              return this.service.update(user.id || this.user.id, user);
            })
          )
          .subscribe(
            (user) => {
              // Reload authenticated user if we're editing the same user
              if (compareEntities(user, this.auth.getUser())) {
                this.auth.setUser(user);
              }

              this.save.emit(user);
            },
            (error: HttpErrorResponse) => {
              this.save.error(error);
              applyNetworkValidationErrors(this.form, error);
            }
          );
      });
    }
  }

  public minorGuardianDialog(user: DeepPartial<PatientUser>): Observable<DeepPartial<PatientUser>> {
    if (!this.service.isEligibleMinor(user.dob)) {
      return of(user);
    }
    return new Observable<PatientUser>((observer) => {
      // Dialog is already open, don't open another.
      if (this.matDialog.openDialogs.filter((d) => d.componentInstance instanceof ProfileGuardianDialogComponent).length > 0) {
        observer.complete();
      } else {
        this.matDialog
          .open(ProfileGuardianDialogComponent, {
            data: {
              guardianName: this.user ? this.user.guardianName : null,
              guardianRelationship: this.user ? this.user.guardianRelationship : null,
            } as ProfileGuardianDialogData,
          })
          .afterClosed()
          .subscribe((result) => {
            if (result) {
              observer.next({ ...user, ...result });
            }
            observer.complete();
          });
      }
    });
  }

  // TODO - may be better to have an 'Exclusive short' property definition of some type...
  private _setFullAddressState() {
    this._sections[ProfileSection.Address] === FormSectionVisibilityType.Short
      ? this.form.get(ProfileSection.Address).get('fullAddress').enable()
      : this.form.get(ProfileSection.Address).get('fullAddress').disable();
  }
}

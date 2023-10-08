import { Component, forwardRef, Input, OnInit, Optional } from '@angular/core';
import { AbstractControl, ControlContainer, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, Validator, Validators } from '@angular/forms';
import { FormInputMaskTypes, getFormFieldError, LabCompany, LabOrderDetailsEntity, MaskValidatorService, ReferralEmbed, ReferrerService, ReferrerType } from '@app/ui';
import { DeepPartial } from 'ts-essentials';
import { AbstractFormSubGroup } from '../../../shared/types/abstract-form-sub-group';

@Component({
  selector: 'app-doctor-contact-info',
  templateUrl: './doctor-contact-info.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DoctorContactInfoComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DoctorContactInfoComponent),
      multi: true
    }
  ]
})
export class DoctorContactInfoComponent extends AbstractFormSubGroup implements ControlValueAccessor, Validator, OnInit {
  @Input()
  public referral: ReferralEmbed;

  public form: FormGroup;

  public phoneNumberMask = FormInputMaskTypes.phoneNumber;

  public onTouched: () => void;

  constructor(
    fb: FormBuilder,
    private readonly referrerService: ReferrerService,
    @Optional() formControlContainer: ControlContainer,
    private readonly maskValidatorService: MaskValidatorService,
  ) {
    super(formControlContainer);

    this.form = fb.group({
      contactName: [null, Validators.required],
      contactPhone: [null, [Validators.required, this.maskValidatorService.getConformsToMaskValidator(this.phoneNumberMask, 'phoneNumber')]],
      lab: [this.referral && this.referrerService.isReferralActive(this.referral, {
          type: ReferrerType.Partner,
          company: Object.values(LabCompany),
          isRevenuePartner: true
        })
          ? this.referral.data.referrer
          : LabCompany.LabCorp
      ]
    });
  }

  ngOnInit(): void {
    this.registerSubForm(this.form);
  }

  writeValue(obj: DeepPartial<LabOrderDetailsEntity>): void {
    this.form.patchValue(obj);
  }

  isReferralActive(): boolean {
    return (
      !!this.referral &&
      this.referrerService.isReferralActive(this.referral, {
        company: Object.values(LabCompany),
        type: ReferrerType.Partner,
        isRevenuePartner: true
      })
    );
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  registerOnChange(fn: any): void {
    this.form.valueChanges.subscribe(v => {
      fn(v);
    });
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  validate(control: AbstractControl) {
    return this.form.valid ? null : { invalidForm: { valid: false, message: 'Form fields are invalid' } };
  }
}

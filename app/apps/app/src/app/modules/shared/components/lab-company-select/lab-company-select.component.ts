import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { LabCompany, ReferralEmbed, ReferrerType, ReferrerService } from '@app/ui';

/**
 * Manages selection of a given lab company in any context.
 */
@Component({
  selector: 'app-lab-company-select',
  templateUrl: './lab-company-select.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => LabCompanySelectComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => LabCompanySelectComponent),
      multi: true,
    }
  ]
})
export class LabCompanySelectComponent implements ControlValueAccessor, Validator, OnChanges {
  @Input()
  referral: ReferralEmbed;

  @Input()
  queryDate: Date = new Date();

  @Input()
  preferredLab: LabCompany = null;

  public LabCompany = LabCompany;

  public input: FormControl;

  public onTouched: () => void;

  constructor(private readonly referralService: ReferrerService) {
    this.input = new FormControl(null);
  }

  writeValue(obj: any): void {
    /* If the patient user has a referrer lock, we will need to coerce the current value of this field
     * to the referrer. */
    obj = this.isReferralActive() ? (this.referral.data && this.referral.data.referrer) : obj;

    // Value is enum, this evaluation is safe
    if (obj !== this.input.value) {
      this.input.setValue(obj);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    /* Whenever the inbound referrer object changes, let's attempt a rewrite of the current value to determine if it
     * needs to be coerced to a referred value. */
    if (changes.referral && changes.referral.currentValue) {
      /* The native disabled attribute is not supported by reactive forms - we therefore need to respond to changes in
       * the current referral by explicitly setting the enabled/disabled status of the control here. */
      (this.isReferralActive() ? this.input.disable : this.input.enable).call(this.input);
      this.writeValue(this.input.value);
    }
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  registerOnChange(fn: any): void {
    this.input.valueChanges.subscribe(fn);

    /* Sanity measure - this component's writeValue method executes before registerOnChange. Since writeValue can coerce values,
     * we must invoke the callback here as well. */
    if (this.input.value) {
      fn(this.input.value);
    }
  }

  isReferralActive() {
    return this.referral && this.referralService.isReferralActive(this.referral, {
      type: ReferrerType.Partner,
      company: Object.values(LabCompany),

      /* Only revenue partners have an impact on our booking flow */
      isRevenuePartner: true,
      queryDate: this.queryDate,
    });
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return null;
  }
}

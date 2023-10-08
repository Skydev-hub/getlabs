import { Component, DoCheck, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  ControlValueAccessor,
  FormBuilder,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  Validators
} from '@angular/forms';
import { getFormFieldError, LabSample, LabSampleProcessingLabels, LabSampleTemperatureLabels, LabSampleTypeLabels } from '@app/ui';
import { plainToClass } from 'class-transformer';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-team-appointment-required-sample-input',
  templateUrl: './appointment-required-sample-input.component.html',
  styleUrls: ['./appointment-required-sample-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppointmentRequiredSampleInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => AppointmentRequiredSampleInputComponent),
      multi: true,
    }
  ]
})
export class AppointmentRequiredSampleInputComponent implements OnInit, DoCheck, ControlValueAccessor, Validator {

  @Input()
  label: string;

  @Input()
  formControlName: string;

  @Output()
  remove = new EventEmitter<void>();

  form: FormGroup;

  // control: AbstractControl;

  TypeLabels = LabSampleTypeLabels;
  TemperatureLabels = LabSampleTemperatureLabels;
  ProcessingLabels = LabSampleProcessingLabels;

  private touched = false;

  private onTouched: () => void = () => {};

  constructor(fb: FormBuilder, private controlContainer: ControlContainer) {
    this.form = fb.group({
      id: [undefined],
      type: [null, Validators.required],
      quantity: [null, Validators.required],
      temperature: [null, Validators.required],
      processing: [null, Validators.required],
    });
  }

  // ---
  // START: Dirty hack to detect touch events to show errors
  // @see: https://github.com/angular/angular/issues/10887
  // ---
  ngOnInit(): void {
    // this.control = this.controlContainer.control.get(String(this.formControlName));
  }

  ngDoCheck(): void {
    // if (this.touched !== this.control.touched) {
    //   this.touched = this.control.touched;
    //   if (this.touched) {
    //     markFormAsTouched(this.form);
    //   }
    // }
  }
  // ---
  // END: Dirty hack to detect touch events to show errors
  // ---

  registerOnChange(fn: (value: LabSample) => void): void {
    this.form.valueChanges.pipe(
      map(val => plainToClass(LabSample, val)),
    ).subscribe(fn);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  writeValue(value: LabSample): void {
    this.form.patchValue(value, { emitEvent: false });
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.form.disable() : this.form.enable();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this.form.valid ? null : { invalidForm: { valid: false, message: 'Form fields are invalid' } };
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

}

import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AppointmentEntity, getFormFieldError, LabSample, markFormAsTouched } from '@app/ui';
import { plainToClass } from 'class-transformer';

export type AppointmentCollectionRequirements = Pick<AppointmentEntity, 'samples' | 'requiresFasting'>;

@Component({
  selector: 'app-team-appointment-collection-requirements-form',
  templateUrl: './appointment-collection-requirements-form.component.html',
  styleUrls: ['./appointment-collection-requirements-form.component.scss']
})
export class AppointmentCollectionRequirementsFormComponent implements OnInit, OnChanges {

  @Input()
  appointment: AppointmentEntity;

  @Output()
  appointmentChange: EventEmitter<AppointmentEntity> = new EventEmitter<AppointmentEntity>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = fb.group({
      samples: fb.array([], Validators.required),
      requiresFasting: [],
    });
  }

  ngOnInit() {
    if (!(this.appointment instanceof AppointmentEntity)) {
      throw new TypeError('The input \'appointment\' must be an instance of AppointmentEntity');
    }
  }

  ngOnChanges(changes: SimpleChanges): void {

    this.form.patchValue({
      requiresFasting: this.appointment.requiresFasting
    });

    this.samples.clear();
    if (Array.isArray(this.appointment.samples)) {
      this.appointment.samples.forEach(s => {
        this.samples.push(this.createSample(s));
      });
    }
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  submit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      this.appointmentChange.emit(this.form.value);
    }
  }

  get samples(): FormArray {
    return this.form.get('samples') as FormArray;
  }

  addSample() {
    this.samples.push(this.createSample());
  }

  removeSample(index: number) {
    this.samples.removeAt(index);
  }


  // ---

  private createSample(sample: LabSample = {}): FormControl {
    return this.fb.control(plainToClass(LabSample, sample));
  }
}

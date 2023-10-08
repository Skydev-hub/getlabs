import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { applyNetworkValidationErrors, enumValues, getFormFieldError, LabCompany, LabLocationEntity, LabLocationService, markFormAsTouched } from '@app/ui';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-team-lab-details-form',
  templateUrl: './lab-details-form.component.html',
  styleUrls: ['./lab-details-form.component.scss']
})
export class LabDetailsFormComponent implements OnChanges {
  @Input()
  public lab: LabLocationEntity;

  @Output()
  public save = new EventEmitter<LabLocationEntity>();

  public form: FormGroup;

  public req$: Subscription;

  public labCompanies = enumValues(LabCompany);

  public selectedCompanyName: string;

  constructor(private readonly fb: FormBuilder, private readonly service: LabLocationService) {
    this.form = fb.group({
      lab: [null, Validators.required],
      address: [{ value: '', disabled: true }, Validators.required],
      services: [null],
      notes: [null],
      active: [true],
      public: [true]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.lab) {
      const { lab, services, notes, active, address } = this.lab;
      this.form.patchValue({
        lab,
        active,
        address,
        public: this.lab.public,
        services: services && services.join('\n'),
        notes: notes && notes.join('\n')
      });
    }
    this.updateAddressField();
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  updateAddressField() {
    const address = this.form.get('address');
    if (this.form.get('lab').value) {
      address.enable();
    } else {
      address.disable();
    }
    if (this.form.dirty) {
      address.reset();
    }
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;
      const data: LabLocationEntity = {
        id: this.lab ? this.lab.id : undefined,
        lab: model.lab,
        active: !!model.active,
        public: !!model.public,
        place_id: model.address.place_id || this.lab.place_id,
        services: model.services && model.services.split('\n'),
        notes: model.notes && model.notes.split('\n')
      };
      this.req$ = this.service.save(data).subscribe(
        labLocation => this.save.emit(labLocation),
        (error: HttpErrorResponse) => {
          // If there is a unique error on place_id re-map the error to the address field
          const placeIdError = error.error.message.find(e => e.property === 'place_id');
          if (placeIdError) {
            placeIdError.property = 'address';
          }
          applyNetworkValidationErrors(this.form, error);
        }
      );
    }
  }
}

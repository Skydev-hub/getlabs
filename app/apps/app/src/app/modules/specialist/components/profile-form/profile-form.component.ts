import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { applyNetworkValidationErrors, getFormFieldError, markFormAsTouched, SpecialistUser, SpecialistUserService } from '@app/ui';
import { Subscription } from 'rxjs';
import { USStates } from '../../../shared/utils/us-states.data';
import { RegexValidator } from '../../../shared/validators/regex.validator';

@Component({
  selector: 'app-specialist-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnChanges {
  @Input()
  public user: SpecialistUser;

  @Input()
  public btnLabel: string;

  @Output()
  public save = new EventEmitter<SpecialistUser>();

  public form: FormGroup;

  public states = USStates;

  req$: Subscription;

  constructor(private fb: FormBuilder, private service: SpecialistUserService) {
    this.form = fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      address: fb.group({
        street: ['', Validators.required],
        city: ['', Validators.required],
        unit: [''],
        state: ['', Validators.required],
        zipCode: ['', [Validators.required, RegexValidator(/^\d{5}$/, 'zipCode')]]
      })
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.form.patchValue(this.user || {});
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;

      this.req$ = this.service
        .update(this.user.id, {
          firstName: model.firstName,
          lastName: model.lastName,
          email: model.email,
          gender: model.gender,
          address: {
            street: model.address.street,
            unit: model.address.unit,
            city: model.address.city,
            state: model.address.state,
            zipCode: model.address.zipCode
          }
        })
        .subscribe(
          user => this.save.emit(user),
          (error: HttpErrorResponse) => {
            applyNetworkValidationErrors(this.form, error);
          }
        );
    }
  }
}

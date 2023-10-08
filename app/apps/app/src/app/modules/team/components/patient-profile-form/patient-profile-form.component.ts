import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  applyNetworkValidationErrors,
  File,
  FilePurpose,
  FormInputMaskTypes,
  getEntityIdentifier,
  getFormFieldError,
  LabCompany,
  markFormAsTouched,
  PatientUser,
  PatientUserService,
} from '@app/ui';
import { coerceToUtc, DateGranularity } from '../../../shared/utils/date.utils';
import { USStates } from '../../../shared/utils/us-states.data';
import { RegexValidator } from '../../../shared/validators/regex.validator';
import { UploadPlaceholder } from '../../../shared/components/form/input/file-input/file-input.component';

@Component({
  selector: 'app-team-patient-profile-form',
  templateUrl: './patient-profile-form.component.html',
  styleUrls: ['./patient-profile-form.component.scss'],
})
export class PatientProfileFormComponent implements OnChanges {
  @Input()
  public user: PatientUser;

  @Output()
  public save = new EventEmitter<PatientUser>();

  public form: FormGroup;

  public states = USStates;

  public phoneNumberMask = FormInputMaskTypes.phoneNumber;

  public readonly LabCompany = LabCompany;

  constructor(private fb: FormBuilder, private service: PatientUserService) {
    this.form = fb.group({
      firstName: [],
      lastName: [],
      dob: [],
      gender: [],
      phoneNumber: [null, Validators.required],
      email: [],
      address: fb.group({
        street: [],
        city: [],
        state: [],
        zipCode: [null, [RegexValidator(/^\d{5}$/, 'zipCode')]],
        unit: [],
      }),
      notes: [],
      priorIssues: [],
      insurance: fb.group({
        front: [],
        rear: [],
      }),
      guardianName: [],
      guardianRelationship: [],
      guardianConfirmation: [],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.form.patchValue(this.user || {});
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  getFilePurpose(side: 'front' | 'rear'): FilePurpose {
    switch (side) {
      case 'front':
        return FilePurpose.InsuranceFront;
      case 'rear':
        return FilePurpose.InsuranceRear;
      default:
        return null;
    }
  }

  getFileSide(purpose: FilePurpose): string {
    switch (purpose) {
      case FilePurpose.InsuranceFront:
        return 'front';
      case FilePurpose.InsuranceRear:
        return 'rear';
      default:
        return null;
    }
  }

  onInsuranceCardChange(file: File): void {
    if (!(file instanceof UploadPlaceholder) && this.user && this.user.id) {
      const side = this.getFileSide(file.purpose);
      if (!side) {
        return;
      }
      this.service
        .update(this.user.id, {
          insurance: {
            [side]: file.id,
          },
        })
        .subscribe(
          /* eslint-disable-next-line @typescript-eslint/no-empty-function */
          (user) => {},
          (error: HttpErrorResponse) => {
            applyNetworkValidationErrors(this.form, error);
          }
        );
    }
  }

  public isMinor(): boolean {
    return this.service.isMinor(this.form.get('dob').value);
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;

      // only send the guardian confirmation if it's changed to preserve the original timestamp
      const guardianConfirmation =
        !this.user || this.user.guardianConfirmation !== model.guardianConfirmation ? { guardianConfirmation: model.guardianConfirmation } : {};
      this.service
        .save({
          id: this.user ? this.user.id : undefined,
          firstName: model.firstName,
          lastName: model.lastName,
          phoneNumber: model.phoneNumber,
          email: model.email,
          dob: coerceToUtc(model.dob, DateGranularity.day),
          gender: model.gender,
          address: {
            street: model.address.street,
            city: model.address.city,
            state: model.address.state,
            zipCode: model.address.zipCode,
            unit: model.address.unit,
          },
          notes: model.notes,
          priorIssues: model.priorIssues,
          guardianName: model.guardianName,
          guardianRelationship: model.guardianRelationship,
          insurance: {
            // Typecast to 'any' since interface expects File here, but we send ID string to the API
            front: getEntityIdentifier(model.insurance.front) as any,
            rear: getEntityIdentifier(model.insurance.rear) as any,
          },
          ...guardianConfirmation,
        })
        .subscribe(
          (user) => this.save.emit(user),
          (error: HttpErrorResponse) => {
            applyNetworkValidationErrors(this.form, error);
          }
        );
    }
  }
}

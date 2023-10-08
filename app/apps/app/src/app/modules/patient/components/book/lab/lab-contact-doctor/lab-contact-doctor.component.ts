import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import {
  AuthService,
  FilePurpose,
  FormInputMaskTypes,
  getFormFieldError,
  LabCompany,
  markFormAsTouched,
  PatientUser,
  ReferrerService,
  ReferrerType
} from '@app/ui';
import { MinimumLengthArrayValidator } from '../../../../../shared/validators/minimum-length-array.validator';
import { FileTypeSchemes } from '../../../../../shared/components/form/input/file-input/file-input.component';
import { FormGroupControl } from '../../../../../shared/types/form-group-control';
import { BookingFlowService } from '../../../../services/booking-flow.service';
import { AbstractLabComponent } from '../abstract-lab-component/abstract-lab.component';

/**
 * Collects the patient's doctor's details; this compoent is used when the patient elects to have
 * getlabs collect the lab order from the doctor.
 */
@Component({
  templateUrl: './lab-contact-doctor.component.html',
  styleUrls: ['./lab-contact-doctor.component.scss'],
})
export class LabContactDoctorComponent extends AbstractLabComponent {
  LabCompany = LabCompany;

  form: FormGroup;

  public phoneNumberMask = FormInputMaskTypes.phoneNumber.getMaskPattern();

  public FilePurpose = FilePurpose;

  public FileTypeSchemes = FileTypeSchemes;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private referrerService: ReferrerService,
    public bookingFlow: BookingFlowService,
  ) {
    super();

    this.form = fb.group({
      contactInfoSets: fb.array([]),
    });

    this.addLabOrder();
  }

  public doOnSubmit() {
    markFormAsTouched(this.form);

    /* Export the state of the form, and attach the result to the booking flow */
    if (this.form.valid) {
      this.submit.emit(this.contactInfoSets.value.map(contactInfoSetForm => {
        const files = contactInfoSetForm.labOrderFiles.filter(Boolean);
        return {
          ...contactInfoSetForm.contactInfo,
          hasLabOrder: files.length > 0 ? true : contactInfoSetForm.hasLabOrder,
          labOrderFiles: files,
        };
      }));
    }
  }

  public get contactInfoSets(): FormArray {
    return this.form.get('contactInfoSets') as FormArray;
  }

  getError(fieldName: string, form?: AbstractControl): string {
    return getFormFieldError(form ? form as FormGroup : this.form, fieldName);
  }

  getUser(): PatientUser {
    return this.authService.getUser() as PatientUser;
  }

  isReferralActive(): boolean {
    const referral = this.referrerService.getReferrerSnapshot();
    return !!referral && this.referrerService.isReferralActive(referral, {
      type: ReferrerType.Partner,
      isRevenuePartner: true,
    });
  }

  getReferral() {
    return this.referrerService.getReferrerSnapshot();
  }

  removeLabOrder(index: number) {
    this.contactInfoSets.removeAt(index);
  }

  addLabOrder() {
    this.contactInfoSets.push(this.fb.group({
      contactInfo: new FormGroupControl({}),
      labOrderFiles: [[], this.bookingFlow.timeslot.priority ? MinimumLengthArrayValidator(1, 'required') : undefined],
      hasLabOrder: [false],
    }));
  }
}


import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  applyNetworkValidationErrors,
  AuthService,
  File,
  FilePurpose,
  getEntityIdentifier,
  getFormFieldError,
  LabCompany,
  markFormAsTouched,
  PatientUser,
  PatientUserService,
} from '@app/ui';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { UploadPlaceholder } from '../../../../shared/components/form/input/file-input/file-input.component';

@Component({
  templateUrl: './insurance-page.component.html',
  styleUrls: ['./insurance-page.component.scss'],
})
export class InsurancePageComponent implements OnInit {
  user: PatientUser;

  form: FormGroup;

  req$: Subscription;

  insuranceCardReq$: Subscription;

  textReq$: Subscription;

  public readonly LabCompany = LabCompany;

  constructor(
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private service: PatientUserService,
    private auth: AuthService,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.form = fb.group({
      insurance: fb.group({
        front: [],
        rear: [],
      }),
    });
  }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;

    if (!(this.user instanceof PatientUser)) {
      throw new TypeError("The property 'user' must be an instance of PatientUser");
    }

    this.form.patchValue(this.user);
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  onInsuranceCardChange(file: File): void {
    if (!(file instanceof UploadPlaceholder)) {
      const side = this.getFileSide(file.purpose);
      if (!side) {
        return;
      }
      this.insuranceCardReq$ = this.service
        .update(this.user.id, {
          insurance: {
            [side]: file.id,
          },
        })
        .subscribe(
          (user) => {
            this.auth.freshen(user);
          },
          (error: HttpErrorResponse) => {
            applyNetworkValidationErrors(this.form, error);
          }
        );
    }
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;

      this.req$ = this.service
        .update(this.user.id, {
          insurance: {
            // Typecast to 'any' since interface expects File here, but we send ID string to the API
            front: getEntityIdentifier(model.insurance.front) as any,
            rear: getEntityIdentifier(model.insurance.rear) as any,
          },
        })
        .subscribe(
          (user) => {
            this.auth.freshen(user);
            this.toastr.success('Insurance details saved!');
            this.router.navigateByUrl('/settings');
          },
          (error: HttpErrorResponse) => {
            applyNetworkValidationErrors(this.form, error);
          }
        );
    }
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

  textLink() {
    this.textReq$ = this.service.continueInsuranceOnMobile(this.user).subscribe();
  }
}

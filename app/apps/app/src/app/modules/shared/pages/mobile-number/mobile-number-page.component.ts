import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { applyNetworkValidationErrors, markFormAsTouched, User } from '@app/ui';
import { AuthCodeFormComponent } from '../../components/auth-code-form/auth-code-form.component';
import { MobileNumberFormComponent } from '../../components/mobile-number-form/mobile-number-form.component';
import { StepperComponent } from '../../components/stepper/stepper.component';
import { AuthService } from '@app/ui';

@Component({
  templateUrl: './mobile-number-page.component.html',
  styleUrls: ['./mobile-number-page.component.scss'],
})
export class MobileNumberPageComponent implements OnInit {
  @ViewChild(MobileNumberFormComponent, { static: true })
  mobileNumber: MobileNumberFormComponent;

  @ViewChild(AuthCodeFormComponent)
  authCodeForm: AuthCodeFormComponent;

  @ViewChild(StepperComponent, { static: true })
  stepper: StepperComponent;

  user: User;

  phoneNumber: string;

  reqSub: Subscription;

  constructor(private route: ActivatedRoute, private auth: AuthService) {}

  ngOnInit(): void {
    this.user = this.route.snapshot.data.user;

    if (!this.user) {
      throw new TypeError("The property 'user' is required");
    }

    /* Initialize the form with the existing phone number, if available. */
    this.mobileNumber.form.setValue({
      phoneNumber: this.user.phoneNumber,
    });
  }

  requestCode() {
    const form = this.mobileNumber.form;
    markFormAsTouched(form);
    if (form.valid) {
      const model = form.value;
      this.reqSub = this.auth.changeNumber(model.phoneNumber).subscribe(
        () => {
          this.phoneNumber = model.phoneNumber;
          this.stepper.next();
        },
        (error: HttpErrorResponse) => {
          applyNetworkValidationErrors(form, error);
        }
      );
    }
  }
}

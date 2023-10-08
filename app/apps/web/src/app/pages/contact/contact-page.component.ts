import { HttpErrorResponse } from "@angular/common/http";
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {applyNetworkValidationErrors, getFormFieldError, Globals, markFormAsTouched} from '@app/ui';
import { ReCaptchaV3Service } from "ng-recaptcha";
import { Subscription } from "rxjs";
import { flatMap } from "rxjs/operators";
import { ContactService } from "../../../../../../libs/ui/src/lib/services/contact.service";

@Component({
  templateUrl: './contact-page.component.html',
  styleUrls: ['./contact-page.component.scss']
})
export class ContactPageComponent {

  form: FormGroup;

  req$: Subscription;

  globals = Globals;

  sent: boolean = false;

  constructor(private fb: FormBuilder, private service: ContactService, private recaptcha: ReCaptchaV3Service) {
    this.form = fb.group({
      name: [null, Validators.required],
      email: [null, [Validators.required, Validators.email]],
      phoneNumber: [],
      message: [null, Validators.required]
    });
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;

      this.req$ = this.recaptcha.execute('contact').pipe(
        flatMap(token => this.service.send({
          name: model.name,
          email: model.email,
          phoneNumber: model.phoneNumber,
          message: model.message
        }, {
          headers: {
            "X-Recaptcha-Token": token
          }
        }))
      ).subscribe(
        () => {
          this.sent = true;
        },
        (error: HttpErrorResponse) => {
          applyNetworkValidationErrors(this.form, error);
        }
      );
    }
  }

}

import { HttpErrorResponse } from "@angular/common/http";
import { Component } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import {applyNetworkValidationErrors, getFormFieldError, Globals, markFormAsTouched, ProviderService} from '@app/ui';
import { ReCaptchaV3Service } from "ng-recaptcha";
import { Subscription } from "rxjs";
import { flatMap } from "rxjs/operators";

@Component({
  selector: "app-providers-contact",
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.scss"]
})

export class ProvidersContactComponent {

  form: FormGroup;

  req$: Subscription;

  globals = Globals;

  sent: boolean = false;

  constructor(private fb: FormBuilder, private service: ProviderService, private recaptcha: ReCaptchaV3Service) {
    this.form = fb.group({
      name: [null, Validators.required],
      title: [],
      organization: [null, Validators.required],
      specialty: [],
      email: [null, Validators.required],
      phoneNumber: [null, Validators.required],
      address: [null],
    });
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;

      this.req$ = this.recaptcha.execute('create_provider').pipe(
        flatMap(token => this.service.create({
          name: model.name,
          title: model.title,
          organization: model.organization,
          specialty: model.specialty,
          email: model.email,
          phoneNumber: model.phoneNumber,
          address: model.address
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

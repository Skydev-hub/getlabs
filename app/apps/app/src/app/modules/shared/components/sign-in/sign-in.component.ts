import { Component, EventEmitter, Input, OnInit, Output, Type } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService, FormInputMaskTypes, getFormFieldError, markFormAsTouched, MaskValidatorService, UserType } from '@app/ui';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent implements OnInit {

  @Input()
  public userType: Type<UserType>;

  @Output()
  public codeRequested: EventEmitter<string> = new EventEmitter<string>();

  @Input()
  public source: string;

  @Input()
  public buttonLabel: string = 'Sign In';

  public phoneNumberMask = FormInputMaskTypes.phoneNumber;

  public form: FormGroup;

  public req$: Subscription;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private readonly maskValidatorService: MaskValidatorService,
  ) {
    this.form = fb.group({
      phoneNumber: ['', [
        Validators.required,
        this.maskValidatorService.getConformsToMaskValidator(this.phoneNumberMask, 'phoneNumber'),
      ]],
    });
  }

  ngOnInit(): void {
    if (!this.userType) {
      throw new TypeError('The input \'userType\' is required');
    }
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  signIn() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;
      this.req$ = this.auth.authByCode(this.userType, model.phoneNumber, this.source).subscribe(() => {
        this.codeRequested.emit(model.phoneNumber);
      });
    }
  }

  /**
   * @description
   * The autofill event will trigger an input event on this field.  Yet, somehow, the event instance in this case WILL contain a 'data' attribute, as opposed to the auth code
   * field... which does not.  If the input event has a payload of over 10 digits, we will prevent the default input action, and parse out the national tel number, as iPhones like
   * to include the country code as well.
   */
  interceptAutofill(event: any) {
    /* If the input event contains a full phone number, it is an autofill event. */
    const inputData = event.target.value && event.target.value.length > 1 ? event.target.value.replace(/[^\d]/g, '') : null;

    if (inputData && inputData.length > 10) {
      /* Cancel the initial event */
      event.preventDefault();

      /* Filter out the country code, as that is likely what is appended on the string. */
      this.form.get('phoneNumber').setValue(inputData.slice(inputData.length - 10));
    }
  }

}

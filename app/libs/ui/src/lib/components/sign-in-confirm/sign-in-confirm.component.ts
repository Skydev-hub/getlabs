import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output, Type, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import {BehaviorSubject, Subscription, timer} from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { User, UserType } from '../../models/user';
import { MaskValidatorService } from '../../services';
import { AuthService } from '../../services/auth.service';
import { FormInputMaskTypes, getFormFieldError, markFormAsTouched } from '../../utils/form.utils';
import { AuthCodeInputComponent } from '../auth-code-input/auth-code-input.component';

@Component({
  selector: 'app-sign-in-confirm',
  templateUrl: './sign-in-confirm.component.html',
  styleUrls: ['./sign-in-confirm.component.scss'],
})
export class SignInConfirmComponent implements OnInit {

  @Input()
  userType: Type<UserType>;

  @Input()
  phoneNumber: string;

  @Input()
  source: string;

  @Input()
  isPhoneNumberChange = false;

  @Input()
  showExtraButtons = true;

  @Output()
  authenticated: EventEmitter<User> = new EventEmitter<User>();

  codeMask = FormInputMaskTypes.authCode;

  form: FormGroup;

  signInReq$: Subscription;

  resendReq$: Subscription;

  callMeReq$: Subscription;

  resendDisabled = false;
  callMeDisabled = false;

  loading$ = new BehaviorSubject<boolean>(false);

  @ViewChild(AuthCodeInputComponent, { static: true })
  authCodeInput: AuthCodeInputComponent;

  // Track known bad codes here so we don't resubmit them
  private failedCodes: string[] = [];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private toastr: ToastrService,
    private readonly maskValidatorService: MaskValidatorService
  ) {
    this.form = fb.group({
      code: ['', [
        Validators.required,
        this.maskValidatorService.getConformsToMaskValidator(this.codeMask, 'authCode'),
      ]],
    });

    // Auto submit when code is filled in
    this.form.valueChanges.pipe(
      map(val => val.code),
    ).subscribe(code => {
      if (this.form.valid) {
        if (this.failedCodes.includes(code)) {
          this.form.get('code').setErrors({
            authCode: true,
          });
        } else {
          // Small delay here to show the user their auth code was actually filled in.
          // Auto-fill will cause the loading animation to trigger instantly otherwise.
          timer(100).subscribe(() => this.onSubmit());
        }
      }
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

  resend() {
    this.resendReq$ = this.auth.authByCode(this.userType, this.phoneNumber, this.source).subscribe(() => {
      this.toastr.success('Resending your security code now');
      this.failedCodes = [];
      this.resendDisabled = true;
      setTimeout(() => this.resendDisabled = false, 10000);
    });
  }

  call() {
    this.callMeReq$ = this.auth.authByCode(this.userType, this.phoneNumber, this.source, true).subscribe(() => {
      this.toastr.success('Calling with your security code now');
      this.failedCodes = [];
      this.callMeDisabled = true;
      setTimeout(() => this.callMeDisabled = false, 10000);
    });
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid && !this.loading$.getValue()) {
      const model = this.form.value;
      this.loading$.next(true);
      this.signInReq$ = (
        this.isPhoneNumberChange ?
          this.auth.changeNumber(this.phoneNumber, model.code) :
          this.auth.authByCode(this.userType, this.phoneNumber, this.source, undefined, model.code)
      )
        .pipe(
          catchError((err: HttpErrorResponse) => {
            this.loading$.next(false);

            if (err.error && ['auth.user.invalid', 'auth.code.invalid'].includes(err.error.message)) {
              /* Clear the contents of the code form... */
              this.authCodeInput.resetControl();

              this.form.get('code').setErrors({
                authCode: true,
              });

              // Keep track of failed codes so we don't resubmit them
              this.failedCodes.push(model.code);
            }
            throw err;
          }),
          switchMap(() => this.auth.getAuthenticatedUser()),
        ).subscribe(user => this.authenticated.emit(user),
        );
    }
  }

}

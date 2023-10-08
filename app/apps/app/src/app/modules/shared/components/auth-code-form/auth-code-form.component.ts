import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormInputMaskTypes, getFormFieldError, MaskValidatorService } from '@app/ui';

@Component({
  selector: 'app-auth-code-form',
  templateUrl: './auth-code-form.component.html',
  styleUrls: ['./auth-code-form.component.scss']
})
export class AuthCodeFormComponent {

  @Output()
  ngSubmit: EventEmitter<{}> = new EventEmitter<{}>();

  public form: FormGroup;

  public authCodeMask = FormInputMaskTypes.authCode;

  constructor(
    private fb: FormBuilder,
    private readonly maskValidatorService: MaskValidatorService,
  ) {
    this.form = fb.group({
      authCode: ['', [
        Validators.required,
        this.maskValidatorService.getConformsToMaskValidator(this.authCodeMask, 'authCode')
      ]],
    });

    this.form.valueChanges.subscribe(() => {
      // Whenever the auth code form is completed with a valid value, automatically invoke the ngSubmit binding
      // TODO - this should REALLY be passing the currently-entered phone number into the emitted event...
      if (this.form.valid) {
        this.ngSubmit.emit();
      }
    });
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  submit($event: {}) {
    this.ngSubmit.emit($event);
  }

}

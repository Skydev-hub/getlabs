import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormInputMaskTypes, getFormFieldError, MaskValidatorService } from '@app/ui';

@Component({
  selector: 'app-mobile-number-form',
  templateUrl: './mobile-number-form.component.html',
  styleUrls: ['./mobile-number-form.component.scss']
})
export class MobileNumberFormComponent implements OnInit {

  @Output()
  ngSubmit: EventEmitter<{}> = new EventEmitter<{}>();

  public form: FormGroup;

  public phoneNumberMask = FormInputMaskTypes.phoneNumber;

  constructor(
    private fb: FormBuilder,
    private readonly maskValidatorService: MaskValidatorService,
  ) {
    this.form = fb.group({
      phoneNumber: ['', [
        Validators.required,
        this.maskValidatorService.getConformsToMaskValidator(this.phoneNumberMask, 'phoneNumber')
      ]],
    });
  }

  ngOnInit() { }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  submit($event: {}) {
    this.ngSubmit.emit($event);
  }

}

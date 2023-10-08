import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  templateUrl: './create-specialist-dialog.component.html',
  styleUrls: ['./create-specialist-dialog.component.scss']
})
export class CreateSpecialistDialogComponent {

  public form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = fb.group({
      passedInterview: [false, Validators.requiredTrue],
      passedBgCheck: [false, Validators.requiredTrue],
      isCertified: [false, Validators.requiredTrue],
    });
  }

}

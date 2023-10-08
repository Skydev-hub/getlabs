import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { getFormFieldError, markFormAsTouched } from '@app/ui';

export interface ProfileGuardianDialogData {
  guardianName?: string;
  guardianRelationship?: string;
  guardianConfirmation?: boolean;
}

@Component({
  templateUrl: './profile-guardian-dialog.component.html',
  styleUrls: ['.//profile-guardian-dialog.component.css']
})
export class ProfileGuardianDialogComponent implements OnInit {

  form: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProfileGuardianDialogData, fb: FormBuilder, public dialogRef: MatDialogRef<ProfileGuardianDialogComponent>) {
    this.form = fb.group({
      guardianName: ['', Validators.required],
      guardianRelationship: ['', Validators.required],
      guardianConfirmation: [false, Validators.requiredTrue],
    });
  }

  ngOnInit(): void {
   this.form.patchValue(this.data);
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

}

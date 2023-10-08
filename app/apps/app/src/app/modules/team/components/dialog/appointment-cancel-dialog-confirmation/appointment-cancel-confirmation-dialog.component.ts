import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppointmentCancelConfirmationDialogData } from './appointment-cancel-confirmation-dialog-data.interface';

@Component({
  templateUrl: './appointment-cancel-confirmation-dialog.component.html',
  styleUrls: ['./appointment-cancel-confirmation-dialog.component.scss']
})
export class AppointmentCancelConfirmationDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AppointmentCancelConfirmationDialogData,
  ) {}

}

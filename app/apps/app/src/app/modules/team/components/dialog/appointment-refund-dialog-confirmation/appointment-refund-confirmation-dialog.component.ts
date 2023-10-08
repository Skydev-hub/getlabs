import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AppointmentRefundConfirmationDialogData } from './appointment-refund-confirmation-dialog-data.interface';

@Component({
  templateUrl: './appointment-refund-confirmation-dialog.component.html',
  styleUrls: ['./appointment-refund-confirmation-dialog.component.scss']
})
export class AppointmentRefundConfirmationDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: AppointmentRefundConfirmationDialogData,
  ) {}

}

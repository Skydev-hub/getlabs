import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LabLocationEntity } from '@app/ui';

export enum AddressWarningDialogType {
  LabLocation = 'lab-location',
  MissingStreetNumber = 'missing-street-number'
}

export interface AddressWarningDialogData<T = {}> {
  type: AddressWarningDialogType;
  data?: T;
}

export interface AddressWarningLabDialogData extends AddressWarningDialogData<LabLocationEntity> {
  type: AddressWarningDialogType.LabLocation;
}

@Component({
  templateUrl: './address-warning-dialog.component.html',
  styleUrls: ['./address-warning-dialog.component.scss']
})
export class AddressWarningDialogComponent {
  public types = AddressWarningDialogType;

  constructor(@Inject(MAT_DIALOG_DATA) public dialogData: AddressWarningDialogData) {}
}

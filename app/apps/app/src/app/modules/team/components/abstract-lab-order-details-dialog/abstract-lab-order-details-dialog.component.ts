import { Inject, Directive } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { LabOrderDetailsEntity, ReferralEmbed } from '@app/ui';

export interface LabOrderDetailsDialogData {
  labOrderDetailsEntity: LabOrderDetailsEntity;
  ordinal: number;
  referral?: ReferralEmbed;
}

@Directive()
/* eslint-disable-next-line @angular-eslint/directive-class-suffix */
export class AbstractLabOrderDetailsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: LabOrderDetailsDialogData,
    public readonly dialogRef: MatDialogRef<AbstractLabOrderDetailsDialogComponent>
  ) {}
}

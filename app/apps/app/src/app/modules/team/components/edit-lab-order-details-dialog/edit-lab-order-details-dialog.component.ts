import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AbstractLabOrderDetailsDialogComponent } from '../abstract-lab-order-details-dialog/abstract-lab-order-details-dialog.component';

@Component({
  templateUrl: './edit-lab-order-details-dialog.component.html',
  styleUrls: ['./edit-lab-order-details-dialog.component.scss']
})
export class EditLabOrderDetailsDialogComponent extends AbstractLabOrderDetailsDialogComponent implements OnInit {
  public formControl: FormControl;

  ngOnInit(): void {
    this.formControl = new FormControl(this.data.labOrderDetailsEntity || {}, Validators.required);
  }

  save() {
    if (this.formControl.valid) {
      this.dialogRef.close({
        ...(this.data.labOrderDetailsEntity || {}),
        ...this.formControl.value
      });
    }
  }
}

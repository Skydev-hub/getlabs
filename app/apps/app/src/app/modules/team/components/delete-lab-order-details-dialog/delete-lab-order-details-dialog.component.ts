import { Component } from '@angular/core';
import { AbstractLabOrderDetailsDialogComponent } from '../abstract-lab-order-details-dialog/abstract-lab-order-details-dialog.component';

@Component({
  templateUrl: './delete-lab-order-details-dialog.component.html',
})
export class DeleteLabOrderDetailsDialogComponent extends AbstractLabOrderDetailsDialogComponent {
  confirmDelete() {
    this.dialogRef.close(true);
  }
}

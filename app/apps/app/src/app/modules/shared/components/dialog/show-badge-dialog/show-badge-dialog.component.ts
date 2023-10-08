import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ShowBadgeDialogData } from './show-badge-dialog-data.interface';

@Component({
  templateUrl: './show-badge-dialog.component.html',
  styleUrls: ['./show-badge-dialog.component.scss']
})
export class ShowBadgeDialogComponent implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: ShowBadgeDialogData,
  ) {}

  ngOnInit(): void {
    if (!this.data.user) {
      throw new TypeError('The \'user\' data property is required');
    }
  }

}

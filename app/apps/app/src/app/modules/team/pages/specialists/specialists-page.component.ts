import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { CreateSpecialistDialogComponent } from '../../components/dialog/create-specialist-dialog/create-specialist-dialog.component';

@Component({
  templateUrl: './specialists-page.component.html',
  styleUrls: ['./specialists-page.component.scss'],
})
export class SpecialistsPageComponent implements OnInit {

  search = new FormControl();

  constructor(private dialog: MatDialog, private router: Router) {}

  ngOnInit() {
  }

  openChecklistDialog() {
    this.dialog.open(CreateSpecialistDialogComponent).afterClosed().subscribe(result => {
      if (result) {
        this.router.navigateByUrl('/team/specialists/create');
      }
    });
  }

}

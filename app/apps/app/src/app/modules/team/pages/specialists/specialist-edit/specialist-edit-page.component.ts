import { Component, OnInit } from '@angular/core';
// import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpecialistUser } from '@app/ui';
// import { CreateSpecialistDialogComponent } from '../../../components/dialog/create-specialist-dialog/create-specialist-dialog.component';

@Component({
  templateUrl: './specialist-edit-page.component.html',
  styleUrls: ['./specialist-edit-page.component.scss']
})
export class SpecialistEditPageComponent implements OnInit {

  public user: SpecialistUser;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    // private dialog: MatDialog,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;

    // if (!this.user) {
    //   // Use setTimeout to get around issue with view creation during component life cycles
    //   // See: https://github.com/angular/components/issues/5268
    //   setTimeout(() => {
    //     this.dialog.open(CreateSpecialistDialogComponent, {
    //       disableClose: true
    //     });
    //   });
    // }

  }

  onSave(user: SpecialistUser) {
    this.toastr.success('Specialist profile saved!');
    this.router.navigateByUrl(`/team/specialists/${user.id}`);
  }

}

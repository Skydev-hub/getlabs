import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpecialistUser } from '@app/ui';

@Component({
  templateUrl: './specialist-edit-schedule-page.component.html',
  styleUrls: ['./specialist-edit-schedule-page.component.scss']
})
export class SpecialistEditSchedulePageComponent implements OnInit {

  public user: SpecialistUser;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;

    if (!(this.user instanceof SpecialistUser)) {
      throw new TypeError('The property \'user\' must be an instance of SpecialistUser');
    }
  }

  onSave(user: SpecialistUser) {
    this.toastr.success('Specialist schedule saved!');
    this.router.navigateByUrl(`/team/specialists/${ user.id }`);
  }

}

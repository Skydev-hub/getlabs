import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PatientUser } from '@app/ui';
import { AuthService } from '@app/ui';

@Component({
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  user: PatientUser;

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;

    if (!(this.user instanceof PatientUser)) {
      throw new TypeError('The property \'user\' is required');
    }
  }

  onUserSave() {
    this.toastr.success('Profile saved!');
    this.router.navigateByUrl('/settings');
  }

}

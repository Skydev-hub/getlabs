import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SpecialistUser } from '@app/ui';
import { AuthService } from '@app/ui';

@Component({
  templateUrl: './profile-page.component.html',
  styleUrls: ['./profile-page.component.scss']
})
export class ProfilePageComponent implements OnInit {

  user: SpecialistUser;

  constructor(
    public auth: AuthService,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
  }

  onUserSave() {
    this.toastr.success('Profile saved!');
    this.router.navigateByUrl('/care/settings');
  }

}

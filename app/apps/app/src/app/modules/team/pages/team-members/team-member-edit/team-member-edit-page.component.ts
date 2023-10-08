import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { StaffUser } from '@app/ui';
import { AuthService } from '@app/ui';

@Component({
  templateUrl: './team-member-edit-page.component.html',
  styleUrls: ['./team-member-edit-page.component.scss']
})
export class TeamMemberEditPageComponent implements OnInit {

  user: StaffUser;

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
  }

  onSave(user: StaffUser) {
    this.auth.freshen(user);
    this.toastr.success('Profile saved!');
    this.router.navigateByUrl(`/team/team-members/${ user.id }`);
  }

}

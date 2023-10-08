import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { PatientUser } from '@app/ui';

@Component({
  templateUrl: './patient-edit-page.component.html',
  styleUrls: ['./patient-edit-page.component.scss']
})
export class PatientEditPageComponent implements OnInit {

  user: PatientUser;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService
  ) { }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
  }

  onSave(user: PatientUser) {
    this.toastr.success('Patient profile saved!');
    this.router.navigateByUrl(`/team/patients/${ user.id }`);
  }

}

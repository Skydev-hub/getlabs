import { Component, OnInit } from '@angular/core';
import { LabLocationEntity } from '@app/ui';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  templateUrl: './lab-edit-page.component.html',
  styleUrls: ['./lab-edit-page.component.scss']
})
export class LabEditPageComponent implements OnInit {
  public lab: LabLocationEntity;

  constructor(private route: ActivatedRoute, private router: Router, private toastr: ToastrService) {}

  ngOnInit() {
    this.lab = this.route.snapshot.data.lab;
    if (this.lab && !(this.lab instanceof LabLocationEntity)) {
      throw new TypeError("The property 'lab' must be an instance of LabLocationEntity");
    }
  }

  onSave(lab: LabLocationEntity) {
    this.toastr.success('Lab location saved!');
    this.router.navigateByUrl(`/team/labs/${lab.id}`);
  }
}

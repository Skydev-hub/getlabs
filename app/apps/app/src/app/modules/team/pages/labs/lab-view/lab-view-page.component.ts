import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LabLocationEntity } from '@app/ui';

@Component({
  templateUrl: './lab-view-page.component.html',
  styleUrls: ['./lab-view-page.component.scss']
})
export class LabViewPageComponent implements OnInit {
  lab: LabLocationEntity;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.lab = this.route.snapshot.data.lab;

    if (!(this.lab instanceof LabLocationEntity)) {
      throw new TypeError("The property 'lab' must be an instance of LabLocationEntity");
    }
  }
}

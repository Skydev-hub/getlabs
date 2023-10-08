import { Component, Input, OnInit } from '@angular/core';
import { LabLocationEntity } from '@app/ui';

@Component({
  selector: 'app-team-lab-details',
  templateUrl: './lab-details.component.html',
  styleUrls: ['./lab-details.component.scss']
})
export class LabDetailsComponent implements OnInit {
  @Input()
  lab: LabLocationEntity;

  ngOnInit() {
    if (!(this.lab instanceof LabLocationEntity)) {
      throw new TypeError("The input 'lab' must be an instance of LabLocationEntity");
    }
  }
}

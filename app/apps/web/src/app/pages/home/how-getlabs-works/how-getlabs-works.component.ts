import { Component, OnInit } from '@angular/core';
import { LabCompany } from '@app/ui';

@Component({
  selector: "app-how-getlabs-works",
  templateUrl: "./how-getlabs-works.component.html",
  styleUrls: ["./how-getlabs-works.component.scss"]
})
export class HowGetlabsWorksComponent implements OnInit {
  public LabCompany = LabCompany;

  constructor() { }

  ngOnInit() {
  }

}

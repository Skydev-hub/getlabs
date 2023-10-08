import { Component, OnInit } from '@angular/core';
import { LabCompany } from '@app/ui';

@Component({
  selector: "app-benefits",
  templateUrl: "./benefits.component.html",
  styleUrls: ["./benefits.component.scss"]
})
export class BenefitsComponent implements OnInit {

  public LabCompany = LabCompany;

  constructor() { }

  ngOnInit() {
  }

}

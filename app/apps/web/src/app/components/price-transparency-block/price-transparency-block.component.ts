import { Component, OnInit } from '@angular/core';
import { LabCompany } from '@app/ui';
import { FirstVisitOptInDialogComponent } from '../first-visit-opt-in-dialog/first-visit-opt-in-dialog.component';

@Component({
  selector: 'app-price-transparency-block',
  templateUrl: './price-transparency-block.component.html',
  styleUrls: ['./price-transparency-block.component.scss'],
})
export class PriceTransparencyBlockComponent implements OnInit {

  public LabCompany = LabCompany;

  public FirstVisitOptInDialogComponent = FirstVisitOptInDialogComponent;

  constructor() {}

  ngOnInit() {
  }

}

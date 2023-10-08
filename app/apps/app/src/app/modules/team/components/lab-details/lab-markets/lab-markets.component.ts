import { AbstractAssignMarketsComponent } from '../../assign-markets/assign-markets.component';
import { LabLocationEntity, LabLocationService, MarketService } from '@app/ui';
import { FormBuilder } from '@angular/forms';
import { Component } from '@angular/core';

@Component({
  selector: 'app-lab-markets',
  templateUrl: '../../assign-markets/assign-markets.component.html',
  styleUrls: ['../../assign-markets/assign-markets.component.scss']
})
export class LabMarketsComponent extends AbstractAssignMarketsComponent<LabLocationEntity> {
  constructor(protected service: LabLocationService, protected marketService: MarketService, protected fb: FormBuilder) {
    super(service, marketService, fb);
  }
}

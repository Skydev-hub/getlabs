import { Component, Input, OnInit } from '@angular/core';
import { MarketEntity } from '@app/ui';


@Component({
  selector: 'app-team-market-details',
  templateUrl: './market-details.component.html',
  styleUrls: ['./market-details.component.scss'],
})
export class MarketDetailsComponent implements OnInit {

  @Input()
  market: MarketEntity;

  ngOnInit() {
    if (!(this.market instanceof MarketEntity)) {
      throw new TypeError('The input \'market\' must be an instance of MarketEntity');
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MarketEntity } from '@app/ui';

@Component({
  templateUrl: './market-view-page.component.html',
  styleUrls: ['./market-view-page.component.scss'],
})
export class MarketViewPageComponent implements OnInit {

  market: MarketEntity;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.market = this.route.snapshot.data.market;

    if (!(this.market instanceof MarketEntity)) {
      throw new TypeError('The property \'market\' must be an instance of MarketEntity');
    }
  }
}

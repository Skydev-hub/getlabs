import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketEntity } from '@app/ui';
import { ToastrService } from 'ngx-toastr';

@Component({
  templateUrl: './market-edit-schedule-page.component.html',
  styleUrls: ['./market-edit-schedule-page.component.scss'],
})
export class MarketEditSchedulePageComponent implements OnInit {

  public market: MarketEntity;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit() {
    this.market = this.route.snapshot.data.market;

    if (!(this.market instanceof MarketEntity)) {
      throw new TypeError('The property \'market\' must be an instance of MarketEntity');
    }
  }

  onSave(market: MarketEntity) {
    this.toastr.success('Market schedule saved!');
    this.router.navigateByUrl(`/team/markets/${ market.id }`);
  }

}

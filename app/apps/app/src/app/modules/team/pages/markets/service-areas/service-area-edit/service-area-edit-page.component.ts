import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MarketEntity, MarketService, ServiceAreaEntity } from '@app/ui';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { switchMap, takeWhile, tap } from 'rxjs/operators';

@Component({
  templateUrl: './service-area-edit-page.component.html',
  styleUrls: ['./service-area-edit-page.component.scss'],
})
export class ServiceAreaEditPageComponent implements OnInit {

  public serviceArea: ServiceAreaEntity;

  market$: Observable<MarketEntity>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private markets: MarketService,
  ) {
  }

  ngOnInit() {
    this.serviceArea = this.route.snapshot.data.serviceArea;

    if (this.serviceArea && !(this.serviceArea instanceof ServiceAreaEntity)) {
      throw new TypeError('The property \'serviceArea\' must be an instance of ServiceAreaEntity');
    }

    this.market$ = this.route.queryParams.pipe(
      takeWhile(params => params.market),
      switchMap((params) => this.markets.read(params.market))
    );
  }

  onSave(serviceArea: ServiceAreaEntity) {
    this.toastr.success('Service Area saved!');
    this.router.navigateByUrl(`/team/markets/service-areas/${ serviceArea.id }`);
  }

}

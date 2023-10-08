import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PagedResponseDto, MarketEntity, MarketService } from '@app/ui';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { MarketSelectorDialogComponent, MarketSelectorDialogData } from '../market-selector-dialog/market-selector-dialog.component';

@Component({
  selector: 'app-market-selector-button',
  templateUrl: './market-selector-button.component.html',
})
export class MarketSelectorButtonComponent implements OnInit {
  public allMarkets$: Observable<PagedResponseDto<MarketEntity>>;

  constructor(private readonly marketService: MarketService, private readonly matDialog: MatDialog) {}

  ngOnInit(): void {
    this.allMarkets$ = this.marketService.list().pipe(shareReplay(1));
  }

  getActiveMarkets$() {
    return this.marketService.getActiveMarkets$();
  }

  openMarketSelector() {
    this.matDialog.open<MarketSelectorDialogComponent, MarketSelectorDialogData>(MarketSelectorDialogComponent, {
      data: {
        seed$: this.allMarkets$,
      },
    });
  }
}

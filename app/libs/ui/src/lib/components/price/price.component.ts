import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from '@app/shared/environments';

@Component({
  selector: "app-price",
  templateUrl: "./price.component.html",
  styleUrls: ["./price.component.scss"]
})
export class PriceComponent implements OnChanges {

  static FormatShort: string = '1.0-2';
  static FormatLong: string = '1.2';

  @Input()
  price: number = environment.advertisedPrice;

  @Input()
  decimals: boolean = false; // True will always show decimal places even if they are zero, false will show decimals as necessary

  format: string = PriceComponent.FormatShort;

  ngOnChanges(changes: SimpleChanges) {
    if (changes.decimals) {
      this.format = !!changes.decimals.currentValue ? PriceComponent.FormatLong : PriceComponent.FormatShort;
    }
  }

}

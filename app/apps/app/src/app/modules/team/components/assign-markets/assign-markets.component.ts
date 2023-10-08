import { Directive, Input, OnDestroy } from '@angular/core';
import { CrudServiceWithMarkets, MarketEntity, MarketService, SomeValidator } from '@app/ui';
import { Subscription } from 'rxjs';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DeepPartial } from 'ts-essentials';

@Directive()
/* eslint-disable-next-line @angular-eslint/directive-class-suffix, @typescript-eslint/ban-types */
export abstract class AbstractAssignMarketsComponent<E extends object> implements OnDestroy {
  @Input()
  public entity: DeepPartial<{ id: string; markets: MarketEntity[] }>;

  @Input()
  public markets: MarketEntity[];

  @Input()
  public editing = false;

  public form: FormGroup;

  public markets$: Subscription;

  public req$: Subscription;

  protected constructor(protected service: CrudServiceWithMarkets<E>, protected marketService: MarketService, protected fb: FormBuilder) {
    this.form = fb.group({
      markets: fb.array(
        [],
        SomeValidator<{
          model: MarketEntity;
          selected: boolean;
        }>((val) => val.selected)
      ),
    });
  }

  get marketsForm(): FormArray {
    return this.form.get('markets') as FormArray;
  }

  toggleEditMode(isEditing = !this.editing): void {
    if (isEditing && !this.markets$) {
      this.fetchMarkets();
    }
    this.editing = isEditing;
  }

  fetchMarkets(): void {
    this.marketsForm.reset([]);
    this.markets$ = this.marketService.list().subscribe((result) => {
      for (const market of result.data) {
        this.marketsForm.push(
          this.fb.group({
            model: [market],
            selected: this.hasMarket(market),
          })
        );
      }
    });
  }

  hasMarket(market: MarketEntity): boolean {
    return this.entity.markets.filter((m) => m.id === market.id).length > 0;
  }

  getSelectedMarketIds(): string[] {
    return (this.marketsForm.value as Array<{
      model: MarketEntity;
      selected: boolean;
    }>)
      .filter((m) => m.selected)
      .map((m) => m.model.id);
  }

  onSubmit(): void {
    this.req$ = this.service.updateMarkets(this.entity.id, this.getSelectedMarketIds()).subscribe((result) => {
      this.entity.markets = result;
      this.toggleEditMode(false);
    });
  }

  ngOnDestroy() {
    [this.req$, this.markets$].forEach((s) => s && s.unsubscribe());
  }
}

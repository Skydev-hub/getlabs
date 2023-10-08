import { Component, Inject, OnDestroy, OnInit, Optional } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PagedResponseDto, MarketEntity, MarketService, SomeValidator } from '@app/ui';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { concatMap, map, scan, withLatestFrom } from 'rxjs/operators';

export interface MarketSelectorDialogData {
  /**
   * Optimization measure in lieu of being able to cache crud API calls (the results of crud list calls are
   * embedded within a paginated object, and are subject to freeform parameters sets- thus making it more
   * involved to cache).
   */
  seed$?: Observable<PagedResponseDto<MarketEntity>>;
  params?: { [key: string]: string | string[] };
}

@Component({
  templateUrl: './market-selector-dialog.component.html',
  styleUrls: ['./market-selector-dialog.component.scss'],
})
export class MarketSelectorDialogComponent implements OnInit, OnDestroy {
  public form: FormGroup;

  private readonly subscriptions: Subscription[] = [];

  private readonly _offset$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  constructor(
    private readonly marketService: MarketService,
    private readonly formBuilder: FormBuilder,
    private readonly dialogRef: MatDialogRef<MarketSelectorDialogComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) private readonly data: MarketSelectorDialogData
  ) {
    this.form = formBuilder.group({
      /* At least one market must be selected for this form to be deemed as valid. */
      markets: formBuilder.array(
        [],
        SomeValidator<{
          model: MarketEntity;
          selected: boolean;
        }>((val) => val.selected)
      ),

      selectAll: [null],
    });
  }

  get markets(): FormArray {
    return this.form.get('markets') as FormArray;
  }

  get selectAll() {
    return this.form.get('selectAll');
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this._offset$
        .pipe(
          /* Coerce out all offset emissions that are not numbers to 0 */
          map((val) => (typeof val === 'number' ? val : 0)),

          /* Invoke the list API with the prescribed offset */
          concatMap((offset, index) =>
            (!offset && !index && this.data && this.data.seed$
              ? this.data.seed$
              : this.marketService.list({
                  ...(this.data && this.data.params),
                  offset: String(offset),
                })
            ).pipe(
              map((response) => {
                return {
                  ...response,
                  offset,
                };
              })
            )
          ),

          /* If we've been dealing with a non-zero offset value, we must append the resulting vals to the
           * existing collection */
          scan((collector: Array<MarketEntity>, current) => {
            return current.offset !== 0 ? collector.concat(current.data) : current.data;
          }, []),

          /* Combine with the latest known active market so we can assemble a form object */
          withLatestFrom(this.marketService.getActiveMarkets$())

          /* Create form control objects in the markets form array corresponding to the inbound result */
        )
        .subscribe(([result, activeMarkets]) => {
          /* If active markets is empty, that means all markets are currently selected. */
          this.selectAll.setValue(!activeMarkets || !activeMarkets.length);

          result.forEach((market) => {
            this.markets.push(
              this.formBuilder.group({
                model: [market],
                selected: [!activeMarkets || !activeMarkets.length || !!activeMarkets.find((activeMarket) => activeMarket.code === market.code)],
              })
            );
          });
        })
    );

    /* If val is true, we will need to select all elements; if it's false, we will need to deselect all elements. */
    this.subscriptions.push(
      this.selectAll.valueChanges.subscribe((val) => {
        this.markets.controls.forEach((control) =>
          control.patchValue({
            selected: !!val,
          })
        );
      })
    );
  }

  load(offset: number) {
    this._offset$.next(offset);
  }

  confirm() {
    /* Update the currently-set market in the centralized service. */
    const result = (this.markets.value as Array<{
      model: MarketEntity;
      selected: boolean;
    }>).reduce((collector, formControlValue) => {
      /* If the current market is selected, add it to the collected set of markets. */
      if (formControlValue.selected) {
        collector.push(formControlValue.model);
      }

      return collector;
    }, []);

    /* If the number of active markets equals the number of market controls, then all markets are selected.  In that case,
     * we will simply pass in null to indicate effectively 'unsetting' active market. */
    this.marketService.setActiveMarkets(result.length === this.markets.length ? null : result);

    /* Close the dialog accordingly. */
    this.dialogRef.close(result);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}

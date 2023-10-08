import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  compareEntities,
  getFormFieldError,
  LabCompany,
  LabLocationEntity,
  LabLocationService,
  MarketEntity,
  markFormAsTouched,
  ReferralEmbed,
  X_HEADER_MARKETS,
} from '@app/ui';
import { isEqual } from 'lodash-es';
import { Observable } from 'rxjs';
import { distinctUntilChanged, filter, map, skip } from 'rxjs/operators';

@Component({
  selector: 'app-team-lab-selection-form',
  templateUrl: './lab-selection-form.component.html',
  styleUrls: ['./lab-selection-form.component.scss'],
})
export class LabSelectionFormComponent implements OnChanges {
  @Input()
  lab: LabCompany;

  @Input()
  location: LabLocationEntity = null;

  @Input()
  partnerReferral: ReferralEmbed;

  @Input()
  queryDate?: Date = new Date();

  @Input()
  preferredLab?: LabCompany;

  @Input()
  market?: MarketEntity;

  @Output()
  locationChange: EventEmitter<LabLocationEntity> = new EventEmitter<LabLocationEntity>();

  form: FormGroup;

  LabCompany = LabCompany;

  compareEntities = compareEntities;

  locations$: Observable<LabLocationEntity[]>;

  constructor(fb: FormBuilder, private locations: LabLocationService) {
    this.form = fb.group({
      lab: [null, Validators.required],
      location: [null, Validators.required],
    });

    const lab = this.form.get('lab');

    lab.valueChanges
      .pipe(
        // This observable can trigger multiple times, but we're only interested in distinct value changes
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.form.get('location').patchValue(null);
        this.locations$ = this.locations
          .list(
            {
              lab: lab.value,
              limit: '100', // TODO: This code should actually fetch recursively until it loads all locations
            },
            {
              headers: this.market ? { [X_HEADER_MARKETS]: [this.market.code] } : {},
              filters: {
                active: true,
              },
            }
          )
          .pipe(map((resp) => resp.data.sort((x, y) => (x.public === y.public ? 0 : x.public ? 1 : -1))));
      });

    this.form
      .get('location')
      .valueChanges.pipe(
        distinctUntilChanged(),

        /* Skip the first invocation, as the valueChange observable will emit a value upon subscription, which
         * we never need to cascade to the consumer. */
        skip(1),

        /* Filter out all cases where the newly-selected lab location is equivalent to the currently-known
         * lab location. */
        filter((loc: LabLocationEntity) => !isEqual(loc, this.location))
      )
      .subscribe(() => setTimeout(() => this.submit(), 0));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.lab) {
      this.form.patchValue({
        lab: this.lab,
      });
    }

    if (changes.location) {
      this.form.patchValue({
        lab: this.location ? this.location.lab : null,
        location: this.location,
      });
    }
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  submit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      this.locationChange.emit(this.form.value.location);
    }
  }
}

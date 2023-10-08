import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppointmentSampleEntity } from '@app/ui';
import { get } from 'lodash-es';
import { forkJoin, timer } from 'rxjs';
import { finalize, map } from 'rxjs/operators';
import { AppointmentSampleService } from '../../../services/appointment-sample.service';

@Component({
  selector: 'app-appointment-samples-property-checkbox',
  templateUrl: './appointment-samples-property-checkbox.component.html',
  styleUrls: ['./appointment-samples-property-checkbox.component.scss']
})
export class AppointmentSamplesPropertyCheckboxComponent implements OnInit {

  @Input()
  sample: AppointmentSampleEntity;

  @Output()
  sampleChange: EventEmitter<AppointmentSampleEntity> = new EventEmitter<AppointmentSampleEntity>();

  @Input()
  property: keyof Extract<AppointmentSampleEntity, boolean>;

  @Input()
  readonly: boolean = false;

  isLoading = false;

  constructor(private samples: AppointmentSampleService) { }

  ngOnInit() {
    if (!(this.sample instanceof AppointmentSampleEntity)) {
      throw new TypeError('The input \'sample\' must be an instance of LabSample');
    }

    if (typeof this.property !== 'string') {
      throw new TypeError('The input \'property\' must be a string');
    }
  }

  getPropertyValue(): boolean {
    return get(this.sample, this.property, false);
  }

  toggleProperty(sample: AppointmentSampleEntity) {
    this.isLoading = true;

    // Use forkJoin here to introduce an artificial minimum response time of 400ms
    // This is done to ensure the loading animation doesn't just flash in and out if
    // the API response time is really low.

    forkJoin([
      timer(400),
      this.samples.update(sample.id, {
        [this.property]: !this.getPropertyValue(),
      })
    ]).pipe(
      // Map the emitted value to just the value from the HTTP request
      map(data => data[1]),
      finalize(() => this.isLoading = false),
    ).subscribe(s => {
      this.sample = s;
      this.sampleChange.emit(s);
    });
  }

}

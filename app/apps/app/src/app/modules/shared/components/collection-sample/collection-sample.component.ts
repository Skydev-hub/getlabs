import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppointmentEntity, LabSample, LabSampleProcessingLabels, LabSampleTemperatureLabels, LabSampleTypeLabels } from '@app/ui';
import { Subscription } from 'rxjs';
import { AppointmentService } from '../../services/appointment.service';

@Component({
  selector: 'app-collection-sample',
  templateUrl: './collection-sample.component.html',
  styleUrls: ['./collection-sample.component.scss']
})
export class CollectionSampleComponent implements OnInit {

  @Input()
  appointment: AppointmentEntity;

  @Input()
  sample: LabSample;

  @Input()
  number: number;

  @Input()
  label: string;

  @Input()
  locked = false;

  @Output()
  appointmentChange = new EventEmitter<AppointmentEntity>();

  req$: Subscription;

  TypeLabels = LabSampleTypeLabels;
  TemperatureLabels = LabSampleTemperatureLabels;
  ProcessingLabels = LabSampleProcessingLabels;

  constructor(private service: AppointmentService) { }

  ngOnInit() {

    if (!(this.appointment instanceof AppointmentEntity)) {
      throw new TypeError('The input \'appointment\' must be an instance of Appointment');
    }

    if (!(this.sample instanceof LabSample)) {
      throw new TypeError('The input \'sample\' must be an instance of LabSample');
    }

    if (typeof this.number !== 'number') {
      throw new TypeError('The input \'number\' must be a number');
    }
  }

  toggleStatus() {
    if (!this.locked) {
      this.req$ = this.service.toggleSampleStatus(this.appointment.id, this.number, !this.sample.collected)
                      .subscribe(appointment => this.appointmentChange.emit(appointment));
    }
  }

}

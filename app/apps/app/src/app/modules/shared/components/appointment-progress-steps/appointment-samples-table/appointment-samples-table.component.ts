import { DataSource } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {AppointmentEntity, AppointmentSampleEntity, LabSampleProcessingLabels, LabSampleTemperatureLabels, LabSampleTypeLabels} from '@app/ui';
import { classToClass } from 'class-transformer';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppointmentSampleService } from '../../../services/appointment-sample.service';
import { AppointmentSampleUncollectedDialogData } from '../../dialog/appointment-sample-uncollected-dialog/appointment-sample-uncollected-dialog-data.interface';
import { AppointmentSampleUncollectedDialogComponent } from '../../dialog/appointment-sample-uncollected-dialog/appointment-sample-uncollected-dialog.component';
import { AppointmentSampleUnprocessedDialogData } from '../../dialog/appointment-sample-unprocessed-dialog/appointment-sample-unprocessed-dialog-data.interface';
import { AppointmentSampleUnprocessedDialogComponent } from '../../dialog/appointment-sample-unprocessed-dialog/appointment-sample-unprocessed-dialog.component';

export enum AppointmentSamplesTableColumns {
  SupplyVerificationToggle = 'supply-verification-toggle',
  CollectedToggle = 'collected-toggle',
  ProcessedToggle = 'processed-toggle',
  Quantity = 'quality',
  Type = 'type',
  TypeDetailed = 'type-detailed',
  Temperature = 'temperature',
  Processing = 'processing',
  CollectActions = 'collect-actions',
  ProcessActions = 'process-actions',
}

@Component({
  selector: 'app-appointment-samples-table',
  templateUrl: './appointment-samples-table.component.html',
  styleUrls: ['./appointment-samples-table.component.scss'],
})
export class AppointmentSamplesTableComponent implements OnInit, OnChanges {

  @Input()
  appointment: AppointmentEntity;

  @Output()
  appointmentChange: EventEmitter<AppointmentEntity> = new EventEmitter<AppointmentEntity>();

  @Input()
  columns: AppointmentSamplesTableColumns[] = [];

  @Input()
  showErrors: boolean = true;

  @Input()
  readonly: boolean = false;

  dataSource = new SamplesSource();

  Columns = AppointmentSamplesTableColumns;
  TypeLabels = LabSampleTypeLabels;
  TemperatureLabels = LabSampleTemperatureLabels;
  ProcessingLabels = LabSampleProcessingLabels;

  constructor(private samples: AppointmentSampleService, private dialog: MatDialog) { }

  ngOnInit() {
    if (!(this.appointment instanceof AppointmentEntity)) {
      throw new TypeError('The input \'appointment\' must be an instance of AppointmentEntity');
    }

    if (!Array.isArray(this.columns) || this.columns.length < 1) {
      throw new TypeError('The input \'columns\' must contain at least one entry');
    }

    this.updateDataSource(this.appointment);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.appointment) {
      this.updateDataSource(this.appointment);
    }
  }

  onSampleChanged(sample: AppointmentSampleEntity) {
    // Merge the same in to the appointment
    const idx = this.appointment.samples.findIndex(s => s.id === sample.id);

    if (idx > -1) {
      // Update the sample, and create a new array using the sample data to trigger angular change detection
      this.appointment.samples[idx] = sample;
      this.appointment.samples = [...this.appointment.samples];

      // Clone the appointment object and emit a change event so other components see it as a new object and update properly
      this.appointmentChange.emit(classToClass(this.appointment));

      // Update the current table data source
      this.updateDataSource(this.appointment);
    }
  }

  collectionError(sample: AppointmentSampleEntity, isError: boolean) {
    if (this.readonly) {
      return;
    }

    if (isError) {
      const dialog = this.dialog.open(AppointmentSampleUncollectedDialogComponent, {
        data: {
          sample
        } as AppointmentSampleUncollectedDialogData
      });

      dialog.afterClosed().subscribe((s: AppointmentSampleEntity) => this.onSampleChanged(s));
    } else {
      this.samples.update(sample.id, { uncollectedReason: null }).subscribe(s => this.onSampleChanged(s));
    }
  }

  processingError(sample: AppointmentSampleEntity, isError: boolean) {
    if (this.readonly) {
      return;
    }

    if (isError) {
      const dialog = this.dialog.open(AppointmentSampleUnprocessedDialogComponent, {
        data: {
          sample
        } as AppointmentSampleUnprocessedDialogData
      });

      dialog.afterClosed().subscribe((s: AppointmentSampleEntity) => this.onSampleChanged(s));
    } else {
      this.samples.update(sample.id, { unprocessedReason: null }).subscribe(s => this.onSampleChanged(s));
    }
  }

  // ---

  private updateDataSource(appointment: AppointmentEntity) {
    this.dataSource.data.next(appointment.samples);
  }
}

class SamplesSource extends DataSource<AppointmentSampleEntity> {

  data = new BehaviorSubject<AppointmentSampleEntity[]>([]);

  connect(): Observable<AppointmentSampleEntity[]> {
    return this.data;
  }

  disconnect() {

  }
}

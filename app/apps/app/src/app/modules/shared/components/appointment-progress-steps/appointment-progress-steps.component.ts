import { AfterViewInit, ChangeDetectorRef, Component, Input, OnChanges, OnDestroy, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  AppointmentEntity,
  AppointmentStatus,
  AuthService,
  File,
  FileProcessorStatusDto,
  FilePurpose,
  FileService,
  StaffUser
} from '@app/ui';
import { kebabCase } from 'lodash-es';
import { Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { AppointmentService } from '../../services/appointment.service';
import { parseDataUrl } from '../../utils/file.utils';
import { AppointmentStepComponent } from '../appointment-step/appointment-step.component';
import { AbstractAppointmentStepsComponent } from '../appointment-steps/abstract-appointment-steps.component';
import { DeliveryVerification } from '../delivery-verification-form/delivery-verification-form.component';
import { ShowBadgeDialogData } from '../dialog/show-badge-dialog/show-badge-dialog-data.interface';
import { ShowBadgeDialogComponent } from '../dialog/show-badge-dialog/show-badge-dialog.component';
import { AppointmentSamplesTableColumns } from './appointment-samples-table/appointment-samples-table.component';

enum AppointmentProgressStep {
  ReviewRequirements,
  PrintDeliveryForm,
  DepartToPatient,
  ArriveAtPatient,
  SignAbn,
  CollectSamples,
  ProcessSamples,
  DepartToPSC,
  DeliverSamples
}

@Component({
  selector: 'app-appointment-progress-steps',
  templateUrl: './appointment-progress-steps.component.html',
  styleUrls: ['./appointment-progress-steps.component.scss']
})
export class AppointmentProgressStepsComponent extends AbstractAppointmentStepsComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input()
  readonly: boolean = false;

  @ViewChildren(AppointmentStepComponent)
  steps: QueryList<AppointmentStepComponent>;

  private _completedSteps: AppointmentProgressStep[] = [];

  req$: Subscription;

  generateFormReq$: Subscription;

  deliveryFormProcessor: FileProcessorStatusDto = null;

  // Bind enums to component for use in the template
  Step = AppointmentProgressStep;
  Status = AppointmentStatus;
  SamplesTableColumns = AppointmentSamplesTableColumns;

  constructor(
    private appointments: AppointmentService,
    private files: FileService,
    private auth: AuthService,
    private dialog: MatDialog,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    if (!(this.appointment instanceof AppointmentEntity)) {
      throw new TypeError("The input 'appointment' must be an instance of AppointmentEntity");
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.appointment) {
      this.openNextIncompleteStep();
    }
  }

  ngAfterViewInit(): void {
    this.openNextIncompleteStep();

    /* Necessary to ensure that the population of appointment steps is properly reflected in the embedded instance of the
     * appointment step indexer directive. */
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy() {
    if (this.generateFormReq$) {
      this.generateFormReq$.unsubscribe();
    }
  }

  isStepCompleted(step: AppointmentProgressStep): boolean {
    if (this._completedSteps.includes(step)) {
      return true;
    }

    switch (step) {
      case AppointmentProgressStep.ReviewRequirements:
        return this.appointment.samples.every(sample => !!sample.suppliesVerified);
      case AppointmentProgressStep.PrintDeliveryForm:
        return this.isStepCompleted(AppointmentProgressStep.DepartToPatient);
      case AppointmentProgressStep.DepartToPatient:
        return this.appointment.status === AppointmentStatus.EnRoute || this.isStepCompleted(AppointmentProgressStep.ArriveAtPatient);
      case AppointmentProgressStep.ArriveAtPatient:
        return this.appointment.status === AppointmentStatus.InProgress || this.isStepCompleted(AppointmentProgressStep.CollectSamples);
      case AppointmentProgressStep.SignAbn:
        return this.isStepCompleted(AppointmentProgressStep.CollectSamples);
      case AppointmentProgressStep.CollectSamples:
        return this.isCollectSamplesComplete() || this.isStepCompleted(AppointmentProgressStep.ProcessSamples);
      case AppointmentProgressStep.ProcessSamples:
        return (
          (this.isProcessSamplesComplete() && this.appointment.status === AppointmentStatus.Collected) ||
          this.isStepCompleted(AppointmentProgressStep.DepartToPSC)
        );
      case AppointmentProgressStep.DepartToPSC:
        return this.isStepCompleted(AppointmentProgressStep.DeliverSamples);
      case AppointmentProgressStep.DeliverSamples:
        return this.appointment.status === AppointmentStatus.Completed;
      default:
        return false;
    }
  }

  complete(step: AppointmentProgressStep) {
    this._completedSteps.push(step);
    this.openNextIncompleteStep();
  }

  openNextIncompleteStep() {
    // Wait a tick because the component's view has already been checked
    // See: https://angular.io/guide/lifecycle-hooks#abide-by-the-unidirectional-data-flow-rule

    setTimeout(() => {
      // Open the first incomplete step
      const step = this.steps.find(s => !s.completed);
      if (step) {
        step.open();
      }
    });
  }

  setStatus(status: AppointmentStatus, data?: Partial<AppointmentEntity>): Subscription {
    return this.appointments.updateStatus(this.appointment.id, status, data).subscribe(appointment => {
      this.appointment = appointment;
      this.openNextIncompleteStep();
    });
  }

  confirmDelivery(verification: DeliveryVerification): Subscription {
    const signature = parseDataUrl(verification.signature);
    return this.files
      .create({
        name: `${kebabCase(verification.recipient)}-signature.png`,
        type: signature.mimeType,
        purpose: FilePurpose.Signature,
        data: signature.content
      })
      .pipe(
        switchMap(file =>
          this.appointments.updateStatus(this.appointment.id, AppointmentStatus.Completed, {
            recipient: verification.recipient,
            signature: file instanceof File ? file.id : (file as any)
          })
        )
      )
      .subscribe(appointment => {
        this.appointment = appointment;
        this.openNextIncompleteStep();
      });
  }

  openDeliveryForm(): Subscription {
    return this.files.saveToDisk(this.appointment.deliveryForm);
  }

  /**
   * Fetches the file info if it's ready, or waits for it to finish generating
   */
  getDeliveryFormFile() {
    this.deliveryFormProcessor = null;
    this.generateFormReq$ = this.appointments.waitForFile(this.appointment.id, FilePurpose.AppointmentDeliveryForm).subscribe({
      next: data => {
        this.appointment.deliveryForm = data.file;
        this.deliveryFormProcessor = data;
      },
      complete: () => {
        // If after complete the file is not generated trigger a generation. This will happen with appointments that existed before the pdf background generation.
        if (this.deliveryFormProcessor.file === null) {
          this.triggerDeliveryFormGeneration();
        }
      }
    });
  }

  triggerDeliveryFormGeneration() {
    this.appointments.triggerFileGeneration(this.appointment.id, FilePurpose.AppointmentDeliveryForm).subscribe(() => this.getDeliveryFormFile());
  }

  showBadge() {
    this.dialog.open(ShowBadgeDialogComponent, {
      data: {
        user: this.auth.getUser()
      } as ShowBadgeDialogData,
      panelClass: 'mat-dialog--xs'
    });
  }

  isStaffUser(): boolean {
    return this.auth.getUser() instanceof StaffUser;
  }

  // ---

  private isCollectSamplesComplete(): boolean {
    return this.appointment.samples.every(sample => {
      return sample.collected || !!sample.uncollectedReason;
    });
  }

  private isProcessSamplesComplete(): boolean {
    return this.appointment.samples.every(sample => {
      return sample.processed || !!sample.unprocessedReason || !!sample.uncollectedReason;
    });
  }
}

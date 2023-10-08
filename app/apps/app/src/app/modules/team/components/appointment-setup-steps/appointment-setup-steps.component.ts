import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnChanges,
  OnInit,
  Output,
  QueryList,
  SimpleChanges,
  Type,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
  AppointmentEntity,
  AppointmentStatus,
  AutoUnsubscribe,
  File,
  FilePurpose,
  FileService,
  forEach,
  Globals,
  LabCompany,
  LabLocationEntity,
  LabOrderDetailsEntity,
  LabOrderSeedTypes,
  ReferralEmbed,
  ReferrerService,
  ReferrerType,
} from '@app/ui';
import { classToClass } from 'class-transformer';
import { differenceInHours, isBefore } from 'date-fns';
import { cloneDeep } from 'lodash-es';
import { Observable, Subscription } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { DeepPartial } from 'ts-essentials';
import { AppointmentStepComponent } from '../../../shared/components/appointment-step/appointment-step.component';
import { AbstractAppointmentStepsComponent } from '../../../shared/components/appointment-steps/abstract-appointment-steps.component';
import { FileTypeSchemes } from '../../../shared/components/form/input/file-input/file-input.component';
import { AppointmentService } from '../../../shared/services/appointment.service';
import {
  AbstractLabOrderDetailsDialogComponent,
  LabOrderDetailsDialogData,
} from '../abstract-lab-order-details-dialog/abstract-lab-order-details-dialog.component';
import { AppointmentCollectionRequirements } from '../appointment-collection-requirements-form/appointment-collection-requirements-form.component';
import { DeleteLabOrderDetailsDialogComponent } from '../delete-lab-order-details-dialog/delete-lab-order-details-dialog.component';
import { AssignSpecialistDialogComponent, AssignSpecialistDialogData } from '../dialog/assign-specialist-dialog/assign-specialist-dialog.component';
import { EditLabOrderDetailsDialogComponent } from '../edit-lab-order-details-dialog/edit-lab-order-details-dialog.component';
import { LabOrderPreferenceCase, LabOrderPreferenceComponent } from '../lab-order-preference/lab-order-preference.component';

enum AppointmentSetupStep {
  ReviewLabOrder,
  SelectLab,
  UploadAbn,
  UploadAccuDraw,
  ReviewTestMenu,
  EnterRequirements,
  ConfirmWithSpecialist,
  ConfirmWithPatient,
  MarkReady,
}

/**
 * Describes the time duration between now and
 * (1) the time the booking was created.
 * (2) the appointment start time.
 */
interface AppointmentTimingDurations {
  sinceBooking: number;
  untilAppointment: number;
}

/* The actual struct we will use to define a given collection of available steps. */
type StepApplicabilityIndex = {
  [key in AppointmentSetupStep]?: boolean | ((appointment: AppointmentEntity) => boolean);
};

/* Type for defining the applicable steps for the LabCompany selected for a given appointment. */
type PartnerSpecificAppointmentSetup = {
  [key in LabCompany]?: StepApplicabilityIndex;
};

/* Defines the default set of applicable steps that are generally always applicable. */
const DefaultAppointmentSetup: StepApplicabilityIndex = {
  [AppointmentSetupStep.ReviewLabOrder]: true,
  [AppointmentSetupStep.SelectLab]: true,
  [AppointmentSetupStep.ReviewTestMenu]: true,
  [AppointmentSetupStep.EnterRequirements]: true,
  [AppointmentSetupStep.ConfirmWithSpecialist]: true,
  [AppointmentSetupStep.ConfirmWithPatient]: true,
  [AppointmentSetupStep.MarkReady]: true,
};

/* Only the ABN and AccuDraw form steps are subject to applicability restrictions... these two only apply to appointments
 * that are to be dropped off to LC locations; in the case of ABN, this step only applies to LC-destined appointments for
 * (potential) Medicare patients. */
const PartnerSpecificAppointmentSetupIndex: PartnerSpecificAppointmentSetup = {
  [LabCompany.LabCorp]: {
    ...DefaultAppointmentSetup,
    [AppointmentSetupStep.UploadAccuDraw]: true,
    [AppointmentSetupStep.UploadAbn]: (appointment) => appointment.isMedicare,
  },
};

@Component({
  selector: 'app-team-appointment-setup-steps',
  templateUrl: './appointment-setup-steps.component.html',
  styleUrls: ['./appointment-setup-steps.component.scss'],
})
export class AppointmentSetupStepsComponent extends AbstractAppointmentStepsComponent implements OnInit, OnChanges, AfterViewInit {
  @Output()
  finished: EventEmitter<AppointmentEntity> = new EventEmitter<AppointmentEntity>();

  @Output()
  updated: EventEmitter<AppointmentEntity> = new EventEmitter<AppointmentEntity>();

  @ViewChildren(AppointmentStepComponent)
  steps: QueryList<AppointmentStepComponent>;

  @ViewChild(LabOrderPreferenceComponent)
  labOrderPreferenceComponent: LabOrderPreferenceComponent;

  globals = Globals;

  req$: Subscription | Observable<any>;

  // Bind enums to component for use in the template
  LabOrderPreferenceCase = LabOrderPreferenceCase;
  Step = AppointmentSetupStep;
  Status = AppointmentStatus;
  LabCompany = LabCompany;
  LabOrderSeedTypes = LabOrderSeedTypes;

  FileTypeSchemes = FileTypeSchemes;

  partnerReferral: ReferralEmbed;

  private _completedSteps: AppointmentSetupStep[] = [];

  constructor(
    private appointments: AppointmentService,
    private files: FileService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly matDialog: MatDialog,
    private readonly referrerService: ReferrerService
  ) {
    super();
  }

  ngOnInit() {
    if (!(this.appointment instanceof AppointmentEntity)) {
      throw new TypeError("The input 'appointment' must be an instance of AppointmentEntity");
    }

    /* Resolve the appropriate partner referral for this appointment */
    this.partnerReferral = this.getPartnerReferral(this.appointment);
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

  updateLabOrderDetails(updatedLod: DeepPartial<LabOrderDetailsEntity>) {
    /* Create an array of lab order details objects containing only the ID of each existing object - the ID-only
     * object will be used to identify lab order details entities that are not changing. */
    const updatedLods: DeepPartial<LabOrderDetailsEntity[]> = this.appointment.labOrderDetails.map((lod) => {
      return { id: lod.id };
    });

    /* Check to see if the inbound collection has an ID - if it does, we will update the corresponding index with the updated
     * object. */
    if (updatedLod.id) {
      /* Update the above collection with the updated lab order details set (required as the lack of presence of other lab order details objs
       * indicates an intended deletion, and we must preserve the other objects). */
      updatedLods[updatedLods.findIndex((lod) => lod.id === updatedLod.id)] = updatedLod;
    } else {
      /* Otherwise, we are dealing with a new LabOrderDetailsEntity object.  Append it to the end of the array. */
      updatedLods.push(updatedLod);
    }

    /* Update the appointment */
    const obs$ = this.appointments
      .save({
        id: this.appointment.id,
        labOrderDetails: updatedLods,
      })
      .pipe(shareReplay());

    obs$.subscribe(
      AutoUnsubscribe((appt) => {
        this.appointment = appt;
        this.updated.emit(appt);
      })
    );

    return obs$;
  }

  updateDocument(type: FilePurpose, labOrderDetails: LabOrderDetailsEntity, file: File | File[]) {
    /* Create an update obj that contains the updated file...  */
    const updated: DeepPartial<LabOrderDetailsEntity> = {
      id: labOrderDetails.id,
      [this.getFileProperty(type)]: file,
    };

    return this.updateLabOrderDetails(updated);
  }

  removeFile(type: FilePurpose, labOrderDetails: LabOrderDetailsEntity, file: File) {
    /* Determine the key associated with the supplied file type */
    const key = this.getFileProperty(type);

    const updatedFile = cloneDeep(file);
    updatedFile.isDeleted = true;

    const updated: DeepPartial<LabOrderDetailsEntity> = {
      id: labOrderDetails.id,
      [key]: labOrderDetails[key] instanceof File ? updatedFile : [updatedFile],
    };

    return this.updateLabOrderDetails(updated);
  }

  /* Determine if the step is applicable according to the designated lab... */
  isStepApplicable(step: AppointmentSetupStep): boolean {
    /* Determine whether or not the current appointment is bound to a specific appointment setup applicability index(ces). */
    const applicability: StepApplicabilityIndex =
      (this.appointment.labLocation && this.appointment.labLocation.lab && PartnerSpecificAppointmentSetupIndex[this.appointment.labLocation.lab]) ||
      DefaultAppointmentSetup;

    /* The appointment is considered applicable if it's found in the applicability index as boolean true, or is deemed as
     * applicable through evaluating the defined applicability object. */
    const stepApplicability = applicability[step];

    return !!stepApplicability && (stepApplicability === true || (typeof stepApplicability !== 'boolean' && stepApplicability(this.appointment)));
  }

  isStepCompleted(step: AppointmentSetupStep): boolean {
    if (this._completedSteps.includes(step)) {
      return true;
    }

    switch (step) {
      case AppointmentSetupStep.ReviewLabOrder:
      case AppointmentSetupStep.SelectLab:
        return !!this.appointment.labLocation;
      case AppointmentSetupStep.UploadAbn:
        return this.appointment.labOrderDetails.some((lod) => !!lod.abnDocument);
      case AppointmentSetupStep.UploadAccuDraw:
        /* Not *technically* correct, as a single appointment may have multiple orders bound to different lab companies - however, this is
         * a necessity for now, as a single appointment may only be delivered to a single lab location. */
        return this.appointment.labOrderDetails.every((lod) => lod.isDeleted || !!lod.accuDraw);
      case AppointmentSetupStep.ReviewTestMenu:
      case AppointmentSetupStep.EnterRequirements:
        return Array.isArray(this.appointment.samples) && this.appointment.samples.length > 0;
      case AppointmentSetupStep.ConfirmWithSpecialist:
        return this.appointment.verifiedWithSpecialist;
      case AppointmentSetupStep.ConfirmWithPatient:
        return this.appointment.verifiedWithPatient;
      case AppointmentSetupStep.MarkReady:
        return this.appointment.status !== AppointmentStatus.Pending;
      default:
        return false;
    }
  }

  complete(step: AppointmentSetupStep) {
    this._completedSteps.push(step);
    this.openNextIncompleteStep();
  }

  openNextIncompleteStep(emitFinished?: boolean) {
    // Wait a tick because the component's view has already been checked
    // See: https://angular.io/guide/lifecycle-hooks#abide-by-the-unidirectional-data-flow-rule

    setTimeout(() => {
      // Open the first incomplete step
      const step = this.steps.find((s) => !s.completed);
      if (step) {
        step.open();
      } else {
        this.steps.forEach((s) => s.close());
        if (emitFinished) {
          this.finished.emit(classToClass(this.appointment));
        }
      }
    });
  }

  download(labOrderFiles: Array<File>) {
    labOrderFiles.forEach((file) => this.files.saveToDisk(file));
  }

  saveLabLocation(location: LabLocationEntity) {
    this.req$ = this.appointments
      .save({
        id: this.appointment.id,
        labLocation: location.id as any,
      })
      .subscribe((a) => {
        this.appointment = a;
        this.updated.emit(a);
        /* Change detection must be cycled here as we are dependent on dynamic element counts that are deduced directly from the view. */
        this.changeDetectorRef.detectChanges();
      });
  }

  saveSamples(appointment: AppointmentCollectionRequirements) {
    this.req$ = this.appointments
      .save({
        id: this.appointment.id,
        samples: appointment.samples,
        requiresFasting: appointment.requiresFasting,
      })
      .subscribe((a) => {
        this.appointment = a;
        this.updated.emit(a);
        this.openNextIncompleteStep(true);
      });
  }

  assign() {
    const dialog = this.matDialog.open(AssignSpecialistDialogComponent, {
      data: {
        appointment: this.appointment,
      } as AssignSpecialistDialogData,
    });

    dialog.afterClosed().subscribe((a?: AppointmentEntity) => {
      if (a instanceof AppointmentEntity) {
        this.appointment = a;
        this.updated.emit(a);
      }
    });
  }

  verifiedWithSpecialist() {
    this.req$ = this.appointments
      .save({
        id: this.appointment.id,
        verifiedWithSpecialist: true,
      })
      .subscribe((a) => {
        this.appointment = a;
        this.updated.emit(a);
        this.openNextIncompleteStep(true);
      });
  }

  verifiedWithPatient() {
    this.req$ = this.appointments
      .save({
        id: this.appointment.id,
        verifiedWithPatient: true,
      })
      .subscribe((a) => {
        this.appointment = a;
        this.updated.emit(a);
        this.openNextIncompleteStep(true);
      });
  }

  markReady() {
    this.req$ = this.appointments.updateStatus(this.appointment.id, AppointmentStatus.Confirmed).subscribe((a) => {
      this.appointment = a;
      this.updated.emit(a);
      this.openNextIncompleteStep(true);
    });
  }

  /**
   * Retrieves the timing durations between now and:
   * 1. The time the appointment booking was created
   * 2. The time the appointment starts
   */
  getTimingDurations(): AppointmentTimingDurations {
    const now = new Date();

    return {
      sinceBooking: differenceInHours(now, this.appointment.createdAt),
      untilAppointment: differenceInHours(this.appointment.startAt, now),
    };
  }

  getProvisioningTypes() {
    return this.appointment.labOrderDetails.map((lod) => lod.getLabOrderType());
  }

  openEditLabOrderDialog(labOrderDetailsEntity?: LabOrderDetailsEntity, ordinal?: number) {
    return this.openLabOrderOperatorDialog(
      EditLabOrderDetailsDialogComponent,
      labOrderDetailsEntity,
      (updated) => {
        return {
          /* Can't assume that the user has their lab order, thus we must supply a value of false.   */
          hasLabOrder: false,
          ...updated,
        };
      },
      ordinal
    );
  }

  openRemoveLabOrderDialog(labOrderDetailsEntity: LabOrderDetailsEntity, ordinal: number) {
    return this.openLabOrderOperatorDialog(
      DeleteLabOrderDetailsDialogComponent,
      labOrderDetailsEntity,
      (updated, base) => {
        return {
          ...base,
          isDeleted: true,
        };
      },
      ordinal
    );
  }

  isReferralActive(referral: ReferralEmbed) {
    return (
      !!referral &&
      this.referrerService.isReferralActive(referral, {
        company: Object.values(LabCompany),
        type: ReferrerType.Partner,
        isRevenuePartner: true,
        queryDate: this.appointment.createdAt,
      })
    );
  }

  private getFileProperty(filePurpose: FilePurpose) {
    /* Determine the key associated with the supplied file type */
    const key = AbstractAppointmentStepsComponent.DocumentAttachmentIndex[filePurpose];

    /* If the supplied type is not currently mapped to an appointment file key, then we must throw an exception. */
    if (!key) {
      throw new Error(`The supplied file purpose is not mapped to any appointment key! filePurpose=${filePurpose}`);
    }

    return key;
  }

  private openLabOrderOperatorDialog(
    component: Type<AbstractLabOrderDetailsDialogComponent>,
    labOrderDetailsEntity: LabOrderDetailsEntity,
    updateLabOrder: (updated: DeepPartial<LabOrderDetailsEntity>, old: LabOrderDetailsEntity) => DeepPartial<LabOrderDetailsEntity>,
    ordinal?: number
  ) {
    const obsWrapper: { update$?: Observable<AppointmentEntity> } = {};

    this.matDialog
      .open<AbstractLabOrderDetailsDialogComponent, LabOrderDetailsDialogData, DeepPartial<LabOrderDetailsEntity>>(component, {
        data: {
          referral: this.appointment.patient.partnerReferral[0],
          labOrderDetailsEntity,
          ordinal,
        },
      })
      .afterClosed()
      .subscribe((result) => {
        /* Only perform the update request if a positive result is indicated (i.e. the returned value is truthy) */
        if (!result) {
          return;
        }

        /* Initiate a request to update the resulting lab order details. */
        obsWrapper.update$ = this.updateLabOrderDetails(updateLabOrder(result, labOrderDetailsEntity));
      });

    return obsWrapper;
  }

  private getPartnerReferral(appointment: AppointmentEntity) {
    let result: ReferralEmbed = null;

    // Retrieve the partner referral that is applicable to this appointment
    if (this.appointment.patient.partnerReferral) {
      forEach(this.appointment.patient.partnerReferral, (partnerReferral) => {
        /* Once we find a partner referral that has occurred before the original appointment's creation date, return that
         * referrer. */
        if (partnerReferral.referralMethod === ReferrerType.Partner && isBefore(partnerReferral.referralDate, appointment.createdAt)) {
          result = partnerReferral;

          // False tells forEach to stop iterating.
          return false;
        }
      });
    }

    return result;
  }
}

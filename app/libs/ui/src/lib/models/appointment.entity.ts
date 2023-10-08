import { Type } from 'class-transformer';
import { endOfDay, isPast } from 'date-fns';
import { enumValues } from '../utils/enum.utils';
import { AppointmentSampleEntity } from './appointment-sample.entity';
import { CouponEntity } from './coupon.entity';
import { File } from './file';
import { LabLocationEntity } from './lab-location.entity';
import { LabOrderDetailsEntity } from './lab-order-details.entity';
import { MarketEntity } from './market.entity';
import { PatientUser, SpecialistUser } from './user';

export enum AppointmentStatus {
  Pending = 'pending',
  Confirmed = 'confirmed',
  EnRoute = 'en-route',
  InProgress = 'in-progress',
  Collected = 'collected',
  Completed = 'completed',
  Cancelled = 'cancelled',
  Incomplete = 'incomplete',
}

export class LabSample {
  type?: LabSampleType;

  // Primitive types should not require @Type to convert property, and this was fixed in class-transformer in the past (but seems to be regressed)
  @Type(() => Number)
  quantity?: number;
  temperature?: LabSampleTemperature;
  processing?: LabSampleProcessing;
  collected?: boolean;
  processed?: boolean;
  suppliesVerified?: boolean;
}

export enum LabSampleType {

  // NOTE: The in which these key-value pairs appear define the order in which the specialist
  // should collect them and the order in which they are sorted and displayed in the UI.
  // Check with Dennis Ernst (our phlebotomy expert) before modifying this enum in any way.

  YellowSPSBloodCulture = 'yellow-sps-blood-culture',
  BloodCultureBottles = 'blood-culture-bottles',
  LightBlueSodiumCitrate = 'light-blue-sodium-citrate',
  SerumTubePlainNoAdditive = 'serum-tube-plain-no-additive',
  RedClotActivator = 'red-clot-activator',
  RedGraySpeckledClotActivatorGel = 'red-gray-speckled-clot-activator-gel',
  GoldClotActivatorGel = 'gold-clot-activator-gel',
  GreenSodiumHeparin = 'green-sodium-heparin',
  GreenGraySpeckledSodiumHeparinGel = 'green-gray-speckled-sodium-heparin-gel',
  GreenLithiumHeparin = 'green-lithium-heparin',
  LightGreenLithiumHeparinGel = 'light-green-lithium-heparin-gel',
  GreenGraySpeckledLithiumHeparinGel = 'green-gray-speckled-lithium-heparin-gel',
  LavenderK2EDTA = 'lavender-k2edta',
  LavenderK3EDTA = 'lavender-k3edta',
  PinkK2EDTA = 'pink-k2edta',
  WhiteK2EDTAGel = 'white-k2edta-gel',
  TanK2EDTALead = 'tan-k2edta-lead',
  YellowSPSHLA = 'yellow-sps-hla',
  GraySodiumFluoridePotassiumOxalate = 'gray-sodium-fluoride-potassium-oxalate',
  RoyalBlueSodiumHeparin = 'royal-blue-sodium-heparin',
  OrangeThrombin = 'orange-thrombin',
  UrineContainer = 'urine-container',
}

export const LabSampleTypeLabels = {
  [LabSampleType.YellowSPSBloodCulture]: 'Yellow (SPS, for blood culture)',
  [LabSampleType.BloodCultureBottles]: 'Blood culture bottles (1 aerobic & 1 anaerobic)',
  [LabSampleType.LightBlueSodiumCitrate]: 'Light blue (sodium citrate)',
  [LabSampleType.SerumTubePlainNoAdditive]: 'Serum tube (plain, no additive)',
  [LabSampleType.RedClotActivator]: 'Red (clot activator)',
  [LabSampleType.RedGraySpeckledClotActivatorGel]: 'Red/gray speckled (clot activator & gel)',
  [LabSampleType.GoldClotActivatorGel]: 'Gold (clot activator & gel)',
  [LabSampleType.GreenSodiumHeparin]: 'Green (sodium heparin)',
  [LabSampleType.GreenGraySpeckledSodiumHeparinGel]: 'Green/gray speckled (sodium heparin w/gel)',
  [LabSampleType.GreenLithiumHeparin]: 'Green (lithium heparin)',
  [LabSampleType.LightGreenLithiumHeparinGel]: 'Light green (lithium-heparin w/gel)',
  [LabSampleType.GreenGraySpeckledLithiumHeparinGel]: 'Green/gray speckled (lithium-heparin w/gel)',
  [LabSampleType.LavenderK2EDTA]: 'Lavender (K2EDTA)',
  [LabSampleType.LavenderK3EDTA]: 'Lavender (K3EDTA, lavender stopper)',
  [LabSampleType.PinkK2EDTA]: 'Pink (K2EDTA)',
  [LabSampleType.WhiteK2EDTAGel]: 'White (K2EDTA w/gel)',
  [LabSampleType.TanK2EDTALead]: 'Tan (K2EDTA, for lead)',
  [LabSampleType.YellowSPSHLA]: 'Yellow (SPS, for HLA)',
  [LabSampleType.GraySodiumFluoridePotassiumOxalate]: 'Gray (sodium fluoride/potassium oxalate)',
  [LabSampleType.RoyalBlueSodiumHeparin]: 'Royal blue (sodium heparin)',
  [LabSampleType.OrangeThrombin]: 'Orange (thrombin)',
  [LabSampleType.UrineContainer]: 'Urine Container',
};

export enum LabSampleTemperature {
  Refrigerated = 'refrigerated',
  Ambient = 'ambient',
  Frozen = 'frozen',
}

export const LabSampleTemperatureLabels = {
  [LabSampleTemperature.Refrigerated]: 'Refrigerated',
  [LabSampleTemperature.Ambient]: 'Ambient',
  [LabSampleTemperature.Frozen]: 'Frozen',
};

export enum LabSampleProcessing {
  None = 'none',
  Spin = 'spin',
  SpinAndAliquot = 'spin-and-aliquot',
  ChainOfCustody = 'chain-of-custody',
}

export const LabSampleProcessingLabels = {
  [LabSampleProcessing.None]: 'None',
  [LabSampleProcessing.Spin]: 'Spin',
  [LabSampleProcessing.SpinAndAliquot]: 'Spin and aliquot',
  [LabSampleProcessing.ChainOfCustody]: 'Chain-of-Custody',
};

export enum AppointmentCancelReason {
  NoAnswer = 'no-answer',
  NoConfirm = 'no-confirm',
  PatientRequested = 'patient-requested',
  PatientSelfRequested = 'patient-self-requested',
  PatientProvidedIncorrectInfo = 'patient-incorrect-info',
  PatientBookedInLabAppointment = 'patient-booked-inlab-appointment',
  PatientUnderage = 'patient-underage',
  PatientFailedToFast = 'patient-failed-to-fast',
  LabOrderUnclear = 'lab-order-unclear',
  SpecialistInsufficientSupplies = 'specialist-insufficient-supplies',
  SpecialistUnavailable = 'specialist-unavailable',
  SpecialistNoShow = 'specialist-no-show',
  LogisticsIssue = 'logistics-issue',
  OpsInsufficientSupplies = 'ops-insufficient-supplies',
  UnsupportedTest = 'unsupported-test',
  NoLabOrder = 'no-lab-order',
  Rebooked = 'rebooked', // This status is automatically set by api, do not show as option in UI
  Duplicate = 'duplicate',
  Other = 'other',
}

export const AppointmentCancelReasonLabels = {
  [AppointmentCancelReason.NoAnswer]: 'Patient not available at visit',
  [AppointmentCancelReason.NoConfirm]: 'Patient did not confirm appointment',
  [AppointmentCancelReason.PatientRequested]: 'Patient requested cancellation',
  [AppointmentCancelReason.PatientSelfRequested]: 'Patient self-requested cancellation',
  [AppointmentCancelReason.PatientProvidedIncorrectInfo]: 'Patient provided incorrect information',
  [AppointmentCancelReason.PatientBookedInLabAppointment]: 'Patient thought they booked in-lab appointment',
  [AppointmentCancelReason.PatientUnderage]: 'Patient is underage',
  [AppointmentCancelReason.PatientFailedToFast]: 'Patient did not fast 8-12 hours',
  [AppointmentCancelReason.LabOrderUnclear]: 'Information on lab order was not clear',
  [AppointmentCancelReason.SpecialistInsufficientSupplies]: 'Specialist had insufficient supplies',
  [AppointmentCancelReason.SpecialistUnavailable]: 'Specialist cancelled or was unavailable',
  [AppointmentCancelReason.SpecialistNoShow]: 'Specialist did not show up',
  [AppointmentCancelReason.LogisticsIssue]: 'Logistics issue (e.g. time sensitive, lab closed)',
  [AppointmentCancelReason.OpsInsufficientSupplies]: 'Getlabs had insufficient supplies',
  [AppointmentCancelReason.UnsupportedTest]: 'Unsupported test(s)',
  [AppointmentCancelReason.NoLabOrder]: 'Provider did not supply lab order',
  [AppointmentCancelReason.Rebooked]: 'Appointment was rebooked',
  [AppointmentCancelReason.Duplicate]: 'Appointment was a duplicate',
  [AppointmentCancelReason.Other]: 'Other'
};

export enum AppointmentBookingTypes {
  PatientAppointment = 'patient-appointment'
}

export class AppointmentEntity {
  id: string;

  identifier: string;

  @Type(() => PatientUser)
  patient: PatientUser;

  get market(): MarketEntity | undefined {
    return this.patient.address.serviceArea && this.patient.address.serviceArea.market
  }

  @Type(() => SpecialistUser)
  specialist: SpecialistUser;

  rebookedFrom?: string;

  rebookedTo?: string;

  @Type(() => LabLocationEntity)
  labLocation: LabLocationEntity;

  private _samples: AppointmentSampleEntity[];

  @Type(() => AppointmentSampleEntity)
  get samples(): AppointmentSampleEntity[] {
    return this._samples;
  }

  set samples(samples: AppointmentSampleEntity[]) {
    // Sort samples according to key order in enum
    const order = enumValues(LabSampleType);
    if (Array.isArray(samples)) {
      this._samples = samples.sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
    }
  }

  requiresFasting: boolean;

  verifiedWithPatient: boolean;

  verifiedWithSpecialist: boolean;

  @Type(() => LabOrderDetailsEntity)
  labOrderDetails: LabOrderDetailsEntity[];

  @Type(() => File)
  labOrder: File;

  status: AppointmentStatus;

  @Type(() => Date)
  statusDate: Date;

  cancelReason: AppointmentCancelReason;

  cancelNote: string;

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  startAt: Date;

  @Type(() => Date)
  endAt: Date;

  recipient: string;

  @Type(() => File)
  signature: File;

  @Type(() => File)
  deliveryForm: File;

  @Type(() => CouponEntity)
  coupon: CouponEntity;

  isMedicare: boolean;

  isRebookable: boolean;

  isRefundable: boolean;

  get cancelDescription() {
    return this.cancelReason === AppointmentCancelReason.Other ? this.cancelNote : AppointmentCancelReasonLabels[this.cancelReason];
  }

  isCompleted(): boolean {
    return this.status === AppointmentStatus.Completed;
  }

  isCancelled(): boolean {
    return this.status === AppointmentStatus.Cancelled;
  }

  isCancellable(): boolean {
    return [AppointmentStatus.Pending, AppointmentStatus.Confirmed].includes(this.status);
  }

  isConfirmed(): boolean {
    return this.status === AppointmentStatus.Confirmed;
  }

  isRebooked(): boolean {
    return !!this.rebookedTo;
  }

  /**
   * Determines if the appointment is viewable or if it should be redacted. This generally only applies to specialists.
   *
   * TODO: This should be determined on the server side once context aware serializers are implemented.
   */
  isViewable(): boolean {
    // If the appointment is in progress, then it is viewable
    if ([
      AppointmentStatus.Confirmed,
      AppointmentStatus.EnRoute,
      AppointmentStatus.InProgress,
      AppointmentStatus.Collected,
    ].includes(this.status)) {
      return true;
    }

    // If the appointment is completed and it is still today, it is viewable
    if (this.isCompleted() && !isPast(endOfDay(this.endAt))) {
      return true;
    }

    // Not viewable in all other cases
    return false;
  }
}

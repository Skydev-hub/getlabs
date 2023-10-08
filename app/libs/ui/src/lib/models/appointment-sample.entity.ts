import { LabSampleProcessing, LabSampleTemperature, LabSampleType } from './appointment.entity';

export enum AppointmentSampleUncollectedReason {
  PatientHealthIssue = 'patient-health-issue',
  WeakBloodFlow = 'weak-blood-flow',
  FlatTube = 'flat-tube',
  ConsentWithdrawn = 'consent-withdrawn',
  HematomaFormed = 'hematoma-formed',
  MissedVein = 'missed-vein',
  Other = 'other',
}

export const AppointmentSampleUncollectedReasonLabels = {
  [AppointmentSampleUncollectedReason.PatientHealthIssue]: 'Patient felt dizzy or fainted',
  [AppointmentSampleUncollectedReason.WeakBloodFlow]: 'Blood flow wasn\'t strong enough',
  [AppointmentSampleUncollectedReason.FlatTube]: 'Tube was flat; no additional tubes within reach',
  [AppointmentSampleUncollectedReason.ConsentWithdrawn]: 'Patient withdrew consent',
  [AppointmentSampleUncollectedReason.HematomaFormed]: 'Hematoma formed during draw',
  [AppointmentSampleUncollectedReason.MissedVein]: 'Missed vein; needle relocation not successful',
  [AppointmentSampleUncollectedReason.Other]: 'Other',
};

export enum AppointmentSampleUnprocessedReason {
  SpecimenClotted = 'specimen-clotted',
  SpecimenHemolyzed = 'specimen-hemolyzed',
  InsufficientQuantity = 'insufficient-quantity',
  IncorrectTube = 'incorrect-tube',
  LabellingError = 'labelling-error',
  MisplacedSample = 'misplaced-sample',
  Other = 'other',
}

export const AppointmentSampleUnprocessedReasonLabels = {
  [AppointmentSampleUnprocessedReason.SpecimenClotted]: 'Specimen is clotted',
  [AppointmentSampleUnprocessedReason.SpecimenHemolyzed]: 'Specimen is hemolyzed',
  [AppointmentSampleUnprocessedReason.InsufficientQuantity]: 'Quantity not sufficient',
  [AppointmentSampleUnprocessedReason.IncorrectTube]: 'Incorrect tube collected',
  [AppointmentSampleUnprocessedReason.LabellingError]: 'Labelling error',
  [AppointmentSampleUnprocessedReason.MisplacedSample]: 'Misplaced sample',
  [AppointmentSampleUnprocessedReason.Other]: 'Other',
};

export class AppointmentSampleEntity {

  id: string;

  type: LabSampleType;

  quantity: number;

  temperature: LabSampleTemperature;

  processing: LabSampleProcessing;

  suppliesVerified: boolean;

  collected: boolean;

  uncollectedReason?: AppointmentSampleUncollectedReason;

  uncollectedNote?: string;

  processed: boolean;

  unprocessedReason?: AppointmentSampleUnprocessedReason;

  unprocessedNote?: string;

  isUncollected(): boolean {
    return !!this.uncollectedReason;
  }

  getUncollectedDescription(): string | null {
    return this.isUncollected() ? (
      this.uncollectedReason === AppointmentSampleUncollectedReason.Other ? this.uncollectedNote : AppointmentSampleUncollectedReasonLabels[this.uncollectedReason]
    ) : null;
  }

  isUnprocessed(): boolean {
    return !!this.unprocessedReason;
  }

  getUnprocessedDescription(): string | null {
    return this.isUnprocessed() ? (
      this.unprocessedReason === AppointmentSampleUnprocessedReason.Other ? this.unprocessedNote : AppointmentSampleUnprocessedReasonLabels[this.unprocessedReason]
    ) : null;
  }
}

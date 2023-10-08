export interface StepDispositionData {
  [key: string]: any;
}

export class BookStepDto {
  step: BookStep;
  stepData: StepDispositionData;
  ordinal: number;
}

export enum BookStep {
  LabOrderProvisioningType = 'step-0',
  TimeslotSelection = 'step-1',
  Profile = 'step-2',
  LabOrderEntry = 'step-3',
  Payment = 'step-4',
  Confirmation = 'step-5',
}

export const BookStepNames = {
  [BookStep.LabOrderProvisioningType]: 'Lab Order Provisioning Type',
  [BookStep.TimeslotSelection]: 'Timeslot Selection',
  [BookStep.Profile]: 'Profile',
  [BookStep.LabOrderEntry]: 'Lab Order Entry',
  [BookStep.Payment]: 'Payment',
  [BookStep.Confirmation]: 'Confirmation',
};

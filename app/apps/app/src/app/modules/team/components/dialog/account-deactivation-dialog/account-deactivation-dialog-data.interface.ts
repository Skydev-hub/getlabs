import { PatientDeactivationReason, SpecialistDeactivationReason, StaffDeactivationReason, User } from '@app/ui';

export interface AccountDeactivationReasonOption {
  reason: PatientDeactivationReason | SpecialistDeactivationReason | StaffDeactivationReason;
  label: string;
}

export interface AccountDeactivationDialogData {
  user: User;
  deactivationReasons: AccountDeactivationReasonOption[];
}

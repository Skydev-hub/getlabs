export enum BusinessHoursConfig {
  BusinessHoursStart = 'BUSINESS_HOURS_START',
  BusinessHoursEnd = 'BUSINESS_HOURS_END',
}

export enum PatientBookingHours {
  PatientBookingHoursStart = 'PATIENT_BOOKING_HOURS_START',
  PatientBookingHoursEnd = 'PATIENT_BOOKING_HOURS_END',
}

export class ConfigDto {
  public [BusinessHoursConfig.BusinessHoursStart]: string;

  public [BusinessHoursConfig.BusinessHoursEnd]: string;

  public [PatientBookingHours.PatientBookingHoursStart]: string;

  public [PatientBookingHours.PatientBookingHoursEnd]: string;
}

import { Type as ClassType } from '@angular/core';
import { Type } from 'class-transformer';
import { isAfter, isPast, subDays } from 'date-fns';
import { Point } from 'geojson';
import { SimpleDateTransform } from '../decorators/simple-date-transformer.decorator';
import { asEnum } from '../utils/enum.utils';
import { ReferrerType } from './analytics.dto';
import { File } from './file';
import { MarketEntity } from './market.entity';
import { Schedule } from './schedule';
import { ServiceAreaEntity } from './service-area.entity';

export type UserType = PatientUser | SpecialistUser | StaffUser;

export enum LabCompany {
  LabCorp = 'lab-corp',
  SonoraQuest = 'sonora-quest',
  QuestDiagnostics = 'quest-diagnostics',
  LabXpress = 'lab-xpress'
}

export function resolveLabCompanyAlias(alias: string): LabCompany {
  switch (alias) {
    case 'labcorp':
      return LabCompany.LabCorp;
    case 'quest':
      return LabCompany.QuestDiagnostics;
    default:
      return asEnum(LabCompany, alias);
  }
}

export enum Gender {
  Male = 'male',
  Female = 'female',
  Other = 'other'
}

export enum StaffAccessLevel {
  Support = 'support',
  Administrator = 'admin'
}

export class Address {
  street: string;
  unit: string;
  city: string;
  state: string;
  zipCode: string;
  geo?: Point;
  distance?: number;
  composed: string;

  get geocoding(): Point | undefined {
    return this.geo || undefined;
  }

  toString(short: boolean = false) {
    return `${this.street}` + (this.unit ? `, ${this.unit}` : '') + (!short ? `, ${this.city}, ${this.state}, ${this.zipCode}` : '');
  }
}

export class AddressWithServiceArea extends Address {
  @Type(() => ServiceAreaEntity)
  serviceArea?: ServiceAreaEntity;

  get geocoding(): Point | undefined {
    return super.geocoding || (this.serviceArea ? this.serviceArea.geo : null) || undefined;
  }
}

export class Insurance {
  @Type(() => File)
  front: File;

  @Type(() => File)
  rear: File;
}

export class SpecialistSchedule extends Schedule {
  exposeHours?: boolean;
}

export enum DocumentType {
  EEA = 'eea',
  W4 = 'w4',
  HIPAA = 'hipaa',
  BBP = 'bbp'
}

export class Document {
  type: DocumentType;

  signature?: string;

  @Type(() => Date)
  completedAt: Date;
}

export class DocumentSigningUrl {
  signUrl: string;

  @Type(() => Date)
  expiresAt: Date;
}

export enum PatientDeactivationReason {
  PatientRequested = 'patient-requested',
  DuplicateAccount = 'duplicate-account',
  InappropriateBehavior = 'inappropriate-behavior',
  FrequentCancellations = 'frequent-cancellations',
  FrequentNoShows = 'frequent-no-shows',
  Other = 'other'
}

export const PatientDeactivationReasonLabels = {
  [PatientDeactivationReason.PatientRequested]: 'Patient requested deactivation',
  [PatientDeactivationReason.DuplicateAccount]: 'Duplicate account',
  [PatientDeactivationReason.InappropriateBehavior]: 'Inappropriate behavior',
  [PatientDeactivationReason.FrequentCancellations]: 'Frequent cancellations',
  [PatientDeactivationReason.FrequentNoShows]: 'Frequent no-shows',
  [PatientDeactivationReason.Other]: 'Other'
};

export enum SpecialistDeactivationReason {
  NoShow = 'no-show',
  SampleDropOffLate = 'sample-drop-off-late',
  PoorPerformance = 'poor-performance',
  Untrustworthy = 'untrustworthy',
  Unprofessional = 'unprofessional',
  PatientComplaints = 'patient-complaints',
  RarelyAvailable = 'rarely-available',
  FrequentCancellations = 'frequent-cancellations',
  Other = 'other'
}

export const SpecialistDeactivationReasonLabels = {
  [SpecialistDeactivationReason.NoShow]: 'Did not show up at an appointment',
  [SpecialistDeactivationReason.SampleDropOffLate]: 'Did not drop off samples on time',
  [SpecialistDeactivationReason.PoorPerformance]: 'Poor work performance',
  [SpecialistDeactivationReason.Untrustworthy]: 'Dishonest and/or untrustworthy',
  [SpecialistDeactivationReason.Unprofessional]: 'Unreliable and/or unprofessional',
  [SpecialistDeactivationReason.PatientComplaints]: 'Multiple patient complaints',
  [SpecialistDeactivationReason.RarelyAvailable]: 'Rarely available',
  [SpecialistDeactivationReason.FrequentCancellations]: 'Frequent cancellations',
  [SpecialistDeactivationReason.Other]: 'Other'
};

export enum StaffDeactivationReason {
  NoLongerEmployed = 'no-longer-employed',
  RepeatMistakes = 'repeat-mistakes',
  Untrustworthy = 'untrustworthy',
  Unprofessional = 'unprofessional',
  Other = 'other'
}

export const StaffDeactivationReasonLabels = {
  [StaffDeactivationReason.NoLongerEmployed]: 'No longer employed or contracted',
  [StaffDeactivationReason.RepeatMistakes]: 'Repeat mistakes',
  [StaffDeactivationReason.Untrustworthy]: 'Dishonest and/or untrustworthy',
  [StaffDeactivationReason.Unprofessional]: 'Unreliable and/or unprofessional',
  [StaffDeactivationReason.Other]: 'Other'
};

export abstract class User {
  id: string;

  email: string;

  phoneNumber: string;

  firstName: string;

  lastName: string;

  @Type(() => File)
  avatar: File;

  @SimpleDateTransform()
  dob: Date;

  @Type(() => AddressWithServiceArea)
  address: AddressWithServiceArea;

  gender: Gender;

  timezone: string;

  @Type(() => Date)
  deactivationDate: Date;

  deactivationReason: PatientDeactivationReason | SpecialistDeactivationReason | StaffDeactivationReason;

  deactivationNote: string;

  isActive: boolean;

  @Type(() => Document)
  documents: Document[];

  @Type(() => Date)
  createdAt: Date;

  @Type(() => Date)
  updatedAt: Date;

  get name(): string {
    return [this.firstName, this.lastName].filter(Boolean).join(' ');
  }

  abstract isProfileCompleted(): boolean;

  abstract getUserType(): ClassType<UserType>;

  isOnboarded(): boolean {
    return true;
  }

  getDocument(type: DocumentType): Document | undefined {
    return (this.documents || []).find(d => d.type === type);
  }

  isDocumentComplete(type?: DocumentType): boolean {
    const documents = type
      ? [this.getDocument(type)]
      : Object.values(DocumentType).map(documentType => {
          return this.getDocument(documentType);
        });

    return documents.every(document => {
      return document && document.completedAt instanceof Date && isPast(document.completedAt);
    });
  }

  isHIPAACompliant(): boolean {
    const doc = this.getDocument(DocumentType.HIPAA);
    return doc && isAfter(doc.completedAt, subDays(new Date(), 365));
  }

  isBBPCompliant(): boolean {
    const doc = this.getDocument(DocumentType.BBP);
    return doc && isAfter(doc.completedAt, subDays(new Date(), 365));
  }
}

export interface ReferralData {
  referrer?: LabCompany;
  [key: string]: any;
}

export interface PeerReferralData extends ReferralData {
  referralLink: string;
}

export class ReferralEmbed<T extends ReferralData = ReferralData> {
  /* Note: when we expand referrals to non-partner cases, we will need to remove this property (in favour of the 'referrer' property in
   * the ReferralData interface above. */
  public partner: LabCompany;

  public analyticsTokens: string[];

  @Type(() => Date)
  public referralDate: Date;

  public referralMethod: ReferrerType;

  public data: T;
}

export class PatientUser extends User {
  @Type(() => Insurance)
  insurance: Insurance;

  notes: string;

  priorIssues: string;

  referralCode: string;

  paymentProfile: any;

  @Type(() => ReferralEmbed)
  partnerReferral: ReferralEmbed[];

  deactivationReason: PatientDeactivationReason;

  intercomIdentityHash: string;

  credits: number;

  guardianName: string;

  guardianRelationship: string;

  guardianConfirmation: boolean;

  isMinor: boolean;

  isEligibleMinor: boolean;

  isServiceable(): boolean {
    return !!this.address && !!this.address.serviceArea && this.address.serviceArea.active;
  }

  isInsuranceProvided(): boolean {
    return !!this.insurance && (!!this.insurance.front || !!this.insurance.rear);
  }

  isProfileCompleted(): boolean {
    return !!this.firstName && !!this.lastName && !!this.dob && !!this.address && !!this.gender;
  }

  getUserType(): ClassType<PatientUser> {
    return PatientUser;
  }
}

export class SpecialistUser extends User {
  @Type(() => MarketEntity)
  markets: MarketEntity[];

  @Type(() => SpecialistSchedule)
  schedule: SpecialistSchedule;

  deactivationReason: SpecialistDeactivationReason;

  isBookable: boolean;

  isScheduled: boolean;

  isAvailable: boolean;

  isProfileCompleted(): boolean {
    return !!this.firstName && !!this.lastName && !!this.email && !!this.gender && !!this.address;
  }

  isOnboarded(): boolean {
    return this.isProfileCompleted() && this.isHIPAACompliant() && this.isBBPCompliant();
  }

  getUserType(): ClassType<SpecialistUser> {
    return SpecialistUser;
  }
}

export class StaffUser extends User {
  @Type(() => MarketEntity)
  markets: MarketEntity[];

  accessLevel: StaffAccessLevel;

  deactivationReason: StaffDeactivationReason;

  isProfileCompleted(): boolean {
    return true;
  }

  isOnboarded(): boolean {
    return this.isProfileCompleted() && this.isHIPAACompliant();
  }

  getUserType(): ClassType<StaffUser> {
    return StaffUser;
  }
}

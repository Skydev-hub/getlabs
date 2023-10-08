import { Type } from 'class-transformer';

export class File {
  id?: string;

  @Type(() => File)
  thumbnail?: File;

  purpose: FilePurpose;

  name: string;

  data: string;

  size?: number;

  type: string;

  @Type(() => Date)
  createdAt?: Date;

  url?: string;

  isDeleted?: boolean;

  isImage(): boolean {
    return ['image/png', 'image/jpeg'].includes(this.type);
  }

  isPDF(): boolean {
    return this.type === 'application/pdf';
  }
}

export enum FilePurpose {
  Avatar = 'avatar',
  InsuranceFront = 'insurance-front',
  InsuranceRear = 'insurance-rear',
  LabOrder = 'lab-order',
  Thumbnail = 'thumbnail',
  Signature = 'signature',
  AbnDocument = 'abn-document',
  AccuDraw = 'accu-draw',
  AppointmentDeliveryForm = 'appointment-delivery-form',
}

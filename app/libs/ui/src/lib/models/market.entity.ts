import { Type } from 'class-transformer';
import { LabAccountEntity } from './lab-account.entity';
import { Schedule } from './schedule';

export class MarketEntity {
  id: string;
  name: string;
  code: string;
  price: number;

  @Type(() => Schedule)
  schedule: Schedule;

  @Type(() => LabAccountEntity)
  labAccountCodes: LabAccountEntity[];

  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

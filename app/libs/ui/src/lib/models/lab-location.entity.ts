import { OpeningHours } from '@google/maps';
import { Type } from 'class-transformer';
import { Address, LabCompany } from './user';
import { MarketEntity } from './market.entity';

export class LabLocationEntity {
  id: string;

  place_id: string;

  slug?: string;

  lab: LabCompany;

  @Type(() => Address)
  address?: Address;

  active: boolean;

  public: boolean;

  services: string[];

  notes: string[];

  @Type(() => MarketEntity)
  markets?: MarketEntity[];
}

export class LabLocationDetails extends LabLocationEntity {
  phoneNumber: string;
  hours: OpeningHours;
}

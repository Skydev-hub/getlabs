import { Injectable } from '@angular/core';
import { Referrer, ReferrerOperator } from '../services/referrer.service';
import { LabCompany } from '../models/user';
import { Observable } from 'rxjs';
import { LabxpressPartnerOperatorService } from '../partners/labxpress-partner-operator.service';

@Injectable()
@Referrer(LabCompany.LabXpress)
export class LabXpressReferrerOperator implements ReferrerOperator {
  constructor(private readonly labxpressPartnerOperatorService: LabxpressPartnerOperatorService) { }

  acknowledge(): Observable<boolean> {
    return this.labxpressPartnerOperatorService.acknowledge();
  }

  getReferrerVectorData() {
    return {};
  }

  isActive(referralActivatedDate: Date, queriedDate?: Date): boolean {
    return this.labxpressPartnerOperatorService.isActive(referralActivatedDate, queriedDate);
  }
}

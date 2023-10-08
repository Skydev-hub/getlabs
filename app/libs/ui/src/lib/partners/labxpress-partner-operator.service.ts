import { Injectable } from '@angular/core';
import { AbstractPartnerOperator, Partner } from '../decorators/partner.decorator';
import { LabCompany } from '../models/user';

import { Observable, of } from 'rxjs';

@Partner(LabCompany.LabXpress, {
  banner: {
    displayName: 'LabXpress',
  },
  referralTtl: 1000 * 60 * 60 * 24,
  aliases: ['labxpress'],
})
@Injectable()
export class LabxpressPartnerOperatorService extends AbstractPartnerOperator {
  acknowledge(): Observable<boolean> {
    /* Our partnership with LabXpress currently does not require an acknowledgement */
    return of(true);
  }
}

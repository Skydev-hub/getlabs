import { Injectable } from '@angular/core';
import { AbstractPartnerOperator, Partner } from '../decorators/partner.decorator';
import { of } from 'rxjs';

export const Rupa = 'rupa';

@Partner(Rupa, {
  banner: {
    displayName: 'Rupa',
    logo: 'rupa-logo-white.png'
  },
  referralTtl: 1000 * 60 * 60 * 24,   // 24 hours, expressed in milliseconds
})
@Injectable()
export class RupaPartnerOperator extends AbstractPartnerOperator {
  acknowledge() {
    // Our partnership with Rupa presently does not require an acknowledgement
    return of(true);
  }
}

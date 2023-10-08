import { Injectable, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';
import { LabCompany } from '../models/user';
import { AbstractPartnerOperator, Partner } from '../decorators/partner.decorator';

/**
 * Partner definition for Labcorp.
 */
@Partner(LabCompany.LabCorp, {
  aliases: ['labcorp'],
  banner: {
    displayName: 'Labcorp',
    logo: 'labcorp-logo-white.png',
  },
  referralTtl: 1000 * 60 * 60 * 24 * 3, // 72 hours, expressed in milliseconds
})
@Injectable()
export class LabcorpPartnerOperator extends AbstractPartnerOperator {
  constructor(private readonly matDialog: MatDialog, injector: Injector) {
    super(injector);
  }

  acknowledge() {
    /* No acknowledgement necessary for non-referred cases */
    return of(true);
  }
}

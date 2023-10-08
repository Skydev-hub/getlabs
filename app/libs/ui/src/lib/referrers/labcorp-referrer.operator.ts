import { Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LabcorpAcknowledgementDialogComponent } from '../components';
import { LabcorpPartnerOperator } from '../partners/labcorp-partner.operator';
import { LabCompany, ReferralData } from '../models/user';
import { of } from 'rxjs';
import { Referrer, ReferrerOperator, ReferrerVectorAcknowledgementData } from '../services/referrer.service';

interface LabcorpReferralData extends ReferralData {
  acknowledged: boolean;
}

/**
 * This class implements the various labcorp-specific parameters/behaviours that apply to various aspects of the
 * website's content and the app's functionality.
 */
@Injectable()
@Referrer(LabCompany.LabCorp)
export class LabcorpReferrerOperator implements ReferrerOperator<LabcorpReferralData> {
  constructor(@Inject(MatDialog) private readonly matDialog: MatDialog, private readonly labcorpCompanyDefinition: LabcorpPartnerOperator) {}

  /**
   * Acknowledgement; demands that the user acknowledge that they are eligible to receive Getlabs' services according to
   * LabCorp's terms.
   */
  acknowledge(ackData: ReferrerVectorAcknowledgementData<LabcorpReferralData>) {
    /* Defers to acknowledge behaviour in the base LC company definition, as this launches a modal that is applicable here too. */
    return !ackData.referral.data || !ackData.referral.data.acknowledged
      ? this.matDialog
          .open(LabcorpAcknowledgementDialogComponent, {
            disableClose: true,
            closeOnNavigation: false,
            panelClass: 'acknowledgement-dialog',
            data: ackData,
          })
          .afterClosed()
      : of(true);
  }

  /**
   * Determines if
   * @param referralDate
   * @param queryDate
   */
  isActive(referralDate: Date, queryDate?: Date) {
    return this.labcorpCompanyDefinition.isActive(referralDate, queryDate);
  }

  /**
   * If the user enters getlabs using the ?=ref URI pattern, they are indicated as already having acknowledged the aforementioned
   * LabCorp terms, which means they do not need to acknowledge them on our side.
   */
  getReferrerVectorData(referralUri: string, currentPath: string) {
    /* Scan the currentPath - if it takes the shape of ?ref=labcorp, that means we're dealing with an acknowledged user.  Otherwise,
     * we are dealing with an unacknowledged user. */
    return {
      acknowledged: /\?ref=/.test(currentPath) && (/ack=true/.test(currentPath) || currentPath.indexOf('ack=') === -1),
    };
  }
}

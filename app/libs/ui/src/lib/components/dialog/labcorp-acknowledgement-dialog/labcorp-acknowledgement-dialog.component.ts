import { Component, Inject, OnInit, Optional } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { LabCompany, ReferrerType } from '../../../models';
import { AnalyticsEventDto } from '../../../models/analytics.dto';
import { ProgressiveDisclosureElementDirective } from '../../../directives/progressive-disclosure-element.directive';
import { AcknowledgementStatus } from '../../../directives/progressive-disclosure.directive';
import { AnalyticsService, ReferrerService, ReferrerVectorAcknowledgementData } from '../../../services';

class LabcorpAcknowledgementAnalyticsEvent extends AnalyticsEventDto {
  constructor(element: ProgressiveDisclosureElementDirective, isAcknowledged: boolean) {
    super('Labcorp Disclosure', {
      element: element.sectionId,
      isAcknowledged,
    });
  }
}

@Component({
  templateUrl: './labcorp-acknowledgement-dialog.component.html',
  styleUrls: ['./labcorp-acknowledgement-dialog.component.scss'],
})
export class LabcorpAcknowledgementDialogComponent implements OnInit {
  public isReferred;

  constructor(
    private readonly matDialogRef: MatDialogRef<LabcorpAcknowledgementDialogComponent>,
    private readonly analyticsService: AnalyticsService,
    @Inject(MAT_DIALOG_DATA) @Optional() private readonly data: ReferrerVectorAcknowledgementData,
    private referrerService: ReferrerService
  ) {}

  ngOnInit(): void {
    this.isReferred =
      this.data &&
      this.data.referral &&
      this.referrerService.isReferralActive(this.data.referral, {
        type: ReferrerType.Partner,
        company: LabCompany.LabCorp,
      });
  }

  acknowledge(acknowledgementStatus: AcknowledgementStatus) {
    /* Call the tracking API */
    this.analyticsService.trackEvent(new LabcorpAcknowledgementAnalyticsEvent(acknowledgementStatus.current, true)).subscribe();

    /* If there is no next progressive disclosure element, consider the full set of acknowledgements effectively resolved. */
    if (!acknowledgementStatus.next) {
      this.matDialogRef.close(true);
    }
  }

  disacknowledge(acknowledgementStatus: AcknowledgementStatus) {
    /* Call the tracking API */
    this.analyticsService
      .trackEvent(new LabcorpAcknowledgementAnalyticsEvent(acknowledgementStatus.current, false))
      .pipe(
        catchError(() => {
          // Deliberately implemented with a null observable, there's nothing we can do here.
          return of(null);
        })
      )
      .subscribe(() => {
        window.location.href = 'https://labcorp.com/';
      });
  }
}

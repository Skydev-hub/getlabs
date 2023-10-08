import { AfterViewInit, ChangeDetectorRef, Component, ContentChildren, OnDestroy, QueryList, TemplateRef } from '@angular/core';
import { forEach } from '../../utils/collection.utils';
import { ReferrerType } from '../../models/analytics.dto';
import { combineLatest, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { ReferrerService } from '../../services/referrer.service';
import { PartnerInlineContentBlock } from './partner-content/partner-inline-content-block.directive';

@Component({
  selector: 'app-partner-inline-content',
  templateUrl: './partner-inline-content.component.html',
})
export class PartnerInlineContentComponent implements AfterViewInit, OnDestroy {
  @ContentChildren(PartnerInlineContentBlock)
  public readonly partnerContentBlocks: QueryList<PartnerInlineContentBlock>;

  public isReferred: boolean;

  public template: TemplateRef<any>;

  private subscription$: Subscription;

  constructor(private readonly referrerService: ReferrerService, private readonly changeDetectorRef: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    /* Set up a subscription of the referrer service and set of partner content blocks - whenever any of these items emits a new
     * value, we must determine the appropriate template to display. */
    this.subscription$ = combineLatest([
      this.referrerService.getReferrer$(),
      this.partnerContentBlocks.changes.pipe(startWith(this.partnerContentBlocks)),
    ]).subscribe((vals) => {
      /* Extract the referrer and partner content blocks from the emitted value. */
      const referralData = vals[0];
      const contentBlocks: QueryList<PartnerInlineContentBlock> = vals[1];

      this.template = null;

      /* Determine the current referral status for ease of use in the template selection loop below */
      const partner =
        referralData &&
        referralData.referral &&
        this.referrerService.isReferralActive(referralData.referral, {
          type: ReferrerType.Partner,
        })
          ? referralData.referral.data.referrer
          : null;

      /* Select the template that is appropriate for the current referral. */
      forEach(contentBlocks.toArray(), (contentBlock) => {
        /* If we are dealing with a hard match (i.e. the tracked partner matches that of the partner block), we can use the resulting
         * content block, and break loop execution (by returning false). */
        if (partner === contentBlock.partner) {
          this.template = contentBlock.templateRef;
          return false;
        }

        /* If we do not have a direct hit, but are working with the default block, assign that now... we can use it should no other
         * partner-defined block be identified. */
        this.template = !contentBlock.partner ? contentBlock.templateRef : this.template;
      });

      this.changeDetectorRef.detectChanges();
    });
  }

  ngOnDestroy(): void {
    this.subscription$?.unsubscribe();
  }
}

import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AutoUnsubscribe, LabCompany, PatientUser, ReferralResolve, ReferrerService } from '@app/ui';
import { isEqual } from 'lodash-es';
import { Observable, of, Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map, share, switchMap, tap } from 'rxjs/operators';
import { BookStep, StepDispositionData } from '../../../../models/book-step.dto';
import { StepperHeaderComponent, StepperStep } from '../../../shared/components/stepper/stepper-header.component';
import { AppointmentBookFlowService } from '../../../shared/services/appointment-book-flow.service';
import { BookingFlowService } from '../../services/booking-flow.service';

interface PartnerAcknowledgement {
  referralResolve: ReferralResolve;
  acknowledged: boolean;
}

@Component({
  templateUrl: './book-page.component.html',
  styleUrls: ['./book-page.component.scss'],
})
export class BookPageComponent implements AfterViewInit, OnInit, OnDestroy {

  @ViewChild(StepperHeaderComponent, { static: true })
  public stepper: StepperHeaderComponent;

  LabCompany = LabCompany;

  steps: StepperStep[] = [
    {
      id: BookStep.TimeslotSelection,
    },
    {
      id: BookStep.Profile,
      title: this.isProfileCompleted() ? null : 'Account',
    },
    {
      id: BookStep.LabOrderEntry,
      title: 'Labs',
    },
    {
      id: BookStep.Payment,
      title: 'Checkout',
    },
    {
      id: BookStep.Confirmation,
    },
  ];

  user: PatientUser;

  BookStep = BookStep;

  constructor(
    private route: ActivatedRoute,
    private appointmentBookFlowService: AppointmentBookFlowService,
    private bookingFlowService: BookingFlowService,
    private router: Router,
    private referrerService: ReferrerService,
  ) {}

  private lastStep: BookStep;

  private acknowledgementsSub$: Subscription;

  private acknowledgements$: Observable<PartnerAcknowledgement>;

  ngOnInit(): void {
    this.router.events.pipe(
      filter(evt => evt instanceof NavigationEnd),
    ).subscribe(() => {
      const txData = this.router.getCurrentNavigation().extras.state;
      /* At the end of every successful navigation event, update the current state of booking workflow with the route's
       * associated step. */
      this.initStep(txData && txData.dispositionData);
    });

    // If a logged in user they skip the profile step
    if (this.isProfileCompleted()) {
      this.steps = this.steps.filter(step => step.id !== BookStep.Profile);
    }
  }

  ngOnDestroy(): void {
    if (this.acknowledgementsSub$) {
      this.acknowledgementsSub$.unsubscribe();
    }
  }

  ngAfterViewInit() {
    this.user = this.route.snapshot.data.user;

    /* Fire an analytics event indicating that the user has started the booking process. */
    // TODO - isReturningUser is no longer a reliable metric when used here - we will need to refactor our
    //  analytics approach to align better with the new booking flow.
    /* Determine the current state based on the current navigation node. */
    /* Traverse through the tree of routes until we find the actual activated route.  The timeout is necessary such that the embedded
     * invocation of this.stepper.setStep invokes after the change detection queue, so that the change is recognized by angular
     * accordingly. */
    setTimeout(() => this.initStep(), 0);
  }

  /**
   * Navigates to the supplied step of the booking flow.
   */
  public goToStep(bookStep: BookStep, dispositionData?: StepDispositionData) {
    /* Navigate to the supplied booking step */
    this.router.navigateByUrl(`/book/${ bookStep }`, { state: { dispositionData } });
  }

  public isProfileCompleted(): boolean {
    return this.route.snapshot.data.user && this.route.snapshot.data.user.isProfileCompleted();
  }
  /**
   * Proceeds to the next booking flow step.  If the next step defined in this object's steps property is not
   * available, this method will throw an exception, as there's a mismatch between the BookStep enum and
   * the steps property.  If the booking flow is on the final step, this method will take no action.
   */
  public nextStep(dispositionData?: StepDispositionData) {
    /* Determine the current step from the stepper, and then advance to the next step. If there is no current step set,
     * then there is no point trying to find the active step. */
    const currentStepIndex = this.stepper.getStep() !== null ?
      this.steps.findIndex(step => this.stepper.isCurrentStep(step.id)) : -1;

    /* Search for the StepperStep definition (i.e. what we fed into StepperHeader) that corresponds to the current step
     * index identified above. If no active step is set, default to the first step. */
    const nextStepDef: StepperStep = currentStepIndex > -1 ?
      (currentStepIndex < this.steps.length - 1) && this.steps[currentStepIndex + 1] :
      this.steps[0];

    /* Search for the book step enum that corresponds with the StepperStep object identified above. */
    const nextStep: BookStep = !!nextStepDef &&
      Object.values(BookStep).find(bookStep => bookStep === nextStepDef.id);

    if (!nextStep) {
      throw new Error(`Cannot invoke transition to next step - there is a discrepancy between the defined
                        BookStep enum and the defined booking flow steps.  Target step index:
                        ${ currentStepIndex + 1 }`);
    }

    this.goToStep(nextStep, dispositionData);
  }

  /**
   * Initializes the current (generally just-transitioned) booking flow step; if the current route defines step data,
   * this method will update the stepper to the step corresponding to the route, and will invoke an endpoint that tracks
   * the newly-activated step.
   */
  private initStep(dispositionData?: StepDispositionData) {
    /* Determine the current state based on the current navigation node. */
    /* Traverse through the tree of routes until we find the actual activated route. */
    const getRouteData = (route: ActivatedRoute) => {
      return !route.firstChild ? route.snapshot.data : getRouteData(route.firstChild);
    };

    const data = getRouteData(this.route);

    if (data && data.step && data.step !== this.lastStep) {
      /* Whenever we land on the first step, we will need to reset the booking flow. */
      if (this.steps.findIndex(step => step.id === data.step) === 0) {
        this.bookingFlowService.reset();
      }

      /* If there is no subscription presently active for managing referred acknowledgements, subscribe now. */
      if (!this.acknowledgementsSub$) {
        /* Whenever the referrer object changes, we will need to respond immediately to changes that may affect the status of the
         * booking flow with this new data at hand. */
        this.acknowledgementsSub$ = this.referrerService.getReferrer$().pipe(
          distinctUntilChanged((prev, curr) => {
            return !curr ? false : !prev || !isEqual(prev.referral, curr.referral);
          }),

          /* If a referral is already in progress, and has not yet been resolved, we will need to wait for that. */
          switchMap((referrer) => {
            /* Switch the resulting observable value to something that includes the result of the in-progress acknowledgement,
             * if applicable. */
            return (this.acknowledgements$ || of(null)).pipe(
              map((lastPa: PartnerAcknowledgement) => {
                /* If the previous acknowledgement references the same partner, and the result of that acknowledgement was affirmative,
                 * then there is no need to continue on with acknowledging the same root referrer. */
                return !lastPa || !lastPa.acknowledged ||
                (lastPa.referralResolve.referral.referralMethod !== referrer.referral.referralMethod) ||
                (lastPa.referralResolve.referral.data && lastPa.referralResolve.referral.data.referrer !== referrer.referral.data.referrer) ?
                  referrer : null;
              }),
            );
          }),

          /* Filter out all ineligible cases where we don't need to re-acknowledge as identified in the above switchMap. */
          filter(referrer => !!referrer),
        ).subscribe(result => {
          this.acknowledgements$ = this.bookingFlowService.doAcknowledgements(result.referral).pipe(
            map(acknowledged => {
              return { acknowledged, referralResolve: result };
            }),

            /* Once the acknowledgement operation is complete, unset the acknowledgements$ observable and
             * unsub the inner subscription */
            tap(() => this.acknowledgements$ = null),

            share(),
          );

          /* Keeping track of this subscription so we can unsubscribe above... */
          this.acknowledgements$.subscribe(AutoUnsubscribe());
        });
      }

      this.stepper.setStep(data.step);
      this.appointmentBookFlowService.bookStep(data.step, this.steps.findIndex(stepperStep => stepperStep.id === data.step),
        dispositionData).subscribe();
      this.lastStep = data.step;
    }
  }
}

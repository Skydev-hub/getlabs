import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormSectionVisibilityType, PatientUser } from '@app/ui';
import { ToastrService } from 'ngx-toastr';
import { Observable, of, Subject } from 'rxjs';
import { flatMap, map } from 'rxjs/operators';
import { DeepPartial } from 'ts-essentials';
import { BookStep } from '../../../../../models/book-step.dto';
import { AnalyticsService } from '@app/ui';
import { AuthService } from '@app/ui';
import { BookPageComponent } from '../../../pages/book/book-page.component';
import { BookingFlowService } from '../../../services/booking-flow.service';
import { ProfileSection, ProfileSectionVisibility } from '../../profile-form/profile-form.component';

@Component({
  templateUrl: './book-contact.component.html',
  styleUrls: ['./book-contact.component.scss']
})
export class BookContactComponent implements OnInit {

  user: PatientUser;

  phoneNumber: string;

  profileSections: ProfileSectionVisibility;

  public PatientUser = PatientUser;

  public submitted = false;

  public bookStep = BookStep.Profile;

  private authenticated$ = new Subject<void>();

  constructor(
    @Optional() private bookPageComponent: BookPageComponent,
    private route: ActivatedRoute,
    private auth: AuthService,
    private toastrService: ToastrService,
    private router: Router,
    private analyticsService: AnalyticsService,
    public bookingFlow: BookingFlowService,
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    if (this.user && this.bookingFlow.address) {
      this.user.address = this.bookingFlow.address;
    }

    // logged in user with completed profile can skip this step, for when the user does not log in until this step
    if (this.user && this.user.isProfileCompleted()) {
      this.nextStep();
    }
    this.profileSections = {
      [ProfileSection.Contact]: (!this.user || !this.user.isProfileCompleted()) ? FormSectionVisibilityType.Short : FormSectionVisibilityType.None,
      [ProfileSection.Address]: FormSectionVisibilityType.None,
      [ProfileSection.AdditionalNotes]: FormSectionVisibilityType.Short
    };
  }

  /**
   * Determines if the user needs to be authenticated before we proceed to the lab order provision step.
   */
  confirmUser = (userObj: DeepPartial<PatientUser>, onSave$: Observable<PatientUser>, onError$: Observable<HttpErrorResponse>) => {
    const onSaveSub$ = onSave$.subscribe(user => {
      /* Set the submitted marker to true */
      this.submitted = true;
      this.user = user;

      /* Positive response - unsubscribe, and move onto the next step, but only if the patient is serviceable */
      if (user.isServiceable()) {
        onSaveSub$.unsubscribe();
        this.nextStep();
      }
    });

    const onErrorSub$ = onError$.subscribe(() => {
      /* Exception returned by the API... invoke retry, display a notification indicating the error. */
      this.toastrService.error('Oops!  We were unable to sign you in.  Please check the form for errors.');
      this.retry();
      onErrorSub$.unsubscribe();
    });

    /* If no user object presently exists, the user will need to authenticate themselves.  Initiate a request
     * to authenticate the user based on the provided phone number, and route to the auth verification
     * entry. */
    if (!this.user) {
      this.auth.authByCode(PatientUser, userObj.phoneNumber, BookStep.Profile).subscribe();
      this.phoneNumber = userObj.phoneNumber;

      /* Link the authenticated user lookup / resolution of the returned deferred operation with the
       * subject that emits a new value whenever auth is successfully completed. */
      return this.authenticated$.pipe(flatMap(() => {
        return this.auth.getAuthenticatedUser();
      })).pipe(map(user => {
        /* Record this sign-up as a conversion if the original user object is not-existent, or is not yet
         * complete. */
        if (!user.isProfileCompleted()) {
          this.analyticsService.triggerTagManagerEvent('profile-completed');
        }

        return { id: user.id, ...userObj };
      }));
    }

    return of(userObj);
  };

  isServiceable(): boolean {
    return !this.submitted || (this.user && this.user.isServiceable());
  }

  retry() {
    this.submitted = false;
    this.phoneNumber = null;
  }

  /**
   * Routes to the sign in view.
   */
  signIn() {
    this.router.navigate(['/sign-in'], {
      queryParams: {
        redirectTo: '/book/step-2'
      }
    });
  }

  nextStep(): Promise<boolean> {
    return this.router.navigateByUrl('/book/step-3');
  }

  /**
   * Executed as soon as the embedded auth code confirmation component is able to authenticate the user.
   * This method invokes a subject/observable, which kicks off a downstream process to a) retrieve the currently
   * authenticated user profile and b) return the raw user object back to the profile form for
   * persistence.
   */
  onAuthenticated() {
    this.authenticated$.next();
    this.authenticated$.complete();
  }
}

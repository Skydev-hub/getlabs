import {isPlatformBrowser} from '@angular/common';
import { Component, EventEmitter, forwardRef, Inject, Input, OnDestroy, OnInit, Output, PLATFORM_ID, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { InlineTemplateManagerDirective } from '../../directives/inline-template-manager.directive';
import { MarketingService } from '../../services/marketing.service';
import { PatientUser } from '../../models/user';
import { AutoUnsubscribe } from '../../utils/http.utils';
import { Subscription } from 'rxjs';
import { filter, pairwise, switchMap, tap } from 'rxjs/operators';
import { OptInResult, OptInType } from '../../models/marketing.dto';

export enum OptInComponentState {
  Unauthenticated = 'Unauthenticated',
  Authenticating = 'Authenticating',
  OptInProgress = 'OptIn',
  Complete = 'Complete'
}

export type OptInAction = () => void;

interface OptInStateDescription {
  action?: OptInAction;
  buttonText?: string;
  isActive: () => boolean;
}


@Component({
  selector: 'app-opt-in',
  templateUrl: './opt-in.component.html',
  styleUrls: ['./opt-in.component.scss']
})
export class OptInComponent implements OnInit, OnDestroy {

  private OptInActions: { [key in OptInComponentState]: OptInStateDescription } = {
    [OptInComponentState.Unauthenticated]: {
      action: () => this.submit(this.formControl.value),
      buttonText: 'Confirm',
      isActive: () => !!this.optInResultSub$ && !this.authCodeSub$ && !this.authService.getUser()
    },

    [OptInComponentState.Authenticating]: {
      isActive: () => !!this.authCodeSub$ && !this.authService.getUser()
    },

    [OptInComponentState.Complete]: {
      isActive: () => !this.optInResultSub$
    },

    [OptInComponentState.OptInProgress]: {
      isActive: () => !!this.authService.getUser() && !!this.optInResultSub$ && !this.authCodeSub$
    }
  };


  @ViewChild(forwardRef(() => InlineTemplateManagerDirective), { static: true })
  public tplManager: InlineTemplateManagerDirective;

  @Input()
  public optInType: OptInType;

  @Output()
  public optInCompleted = new EventEmitter<OptInResult>();

  public formControl = new FormControl(null, [Validators.required]);

  public PatientUser = PatientUser;

  public optInResultSub$: Subscription;

  public OptInComponentState = OptInComponentState;

  private authCodeSub$: Subscription;

  constructor(
    private readonly authService: AuthService,
    private readonly marketingService: MarketingService,
    @Inject(PLATFORM_ID) private readonly platformId: Object,
  ) {}

  ngOnInit(): void {
    /* Only arrange for the authentication listener on non-SSR runtimes */
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    /* Whenever a user comes into context (whether that's by this component, or it's by another authentication component), we
     * should invoke the OptIn process. */
    this.optInResultSub$ = this.authService.user$.pipe(

      pairwise(),

      /* Filter out all not-an-actual-user cases... */
      filter(vals => !!vals[1] && !!vals[1].id && (!vals[0] || vals[0].id !== vals[1].id)),

      /* Unsubscribe the authentication observable regardless of whether or not it was actually set. */
      tap(() => {
        if (this.authCodeSub$) {
          this.authCodeSub$.unsubscribe();
          this.authCodeSub$ = null;
        }
      }),

      /* Once a user profile is available, execute the opt in. */
      switchMap(() => this.marketingService.optIn(this.optInType)),
    ).subscribe(result => {
      /* When the opt in result completes, notify the consumer of the result, and shift our dynamic process observable to complete (regardless of
       * the outcome...) */
      this.optInCompleted.emit(result);

      /* Unset optInResult */
      this.optInResultSub$.unsubscribe();
      this.optInResultSub$ = null;
    });

    this.marketingService.logOptIn(this.optInType, 'Viewed').subscribe(AutoUnsubscribe());
  }

  public invokeAction(state: OptInComponentState) {
    return this.OptInActions[state] && this.OptInActions[state].action();
  }

  public getButtonText(state: OptInComponentState) {
    return this.OptInActions[state] && this.OptInActions[state].buttonText;
  }

  public submit(phoneNumber: string) {
    /* Only initiate the opt in if the supplied phone number is valid... */
    if (this.formControl.valid) {
      /* Create an authentication subject, so we can keep tabs on this process... */
      this.authCodeSub$ = this.authService.authByCode(PatientUser, phoneNumber, 'opt-in').subscribe();
      this.marketingService.logOptIn(this.optInType, 'Start').subscribe(AutoUnsubscribe());
    }
  }

  public getState(): OptInComponentState {
    // Necessary because the TS compiler isn't quite mature enough to differentiate string enums from strings
    return (Object.keys(this.OptInActions) as OptInComponentState[]).find(stateKey => this.OptInActions[stateKey].isActive());
  }

  onAuthenticated() {
    /* Refresh the authenticated user */
    const authUserSub$ = this.authService.getAuthenticatedUser(true ).subscribe(() => {
      /* Unsubscribe upon completion... */
      authUserSub$.unsubscribe();
    });
  }

  ngOnDestroy(): void {
    if (this.optInResultSub$) {
      this.optInResultSub$.unsubscribe();
    }

    if (this.authCodeSub$) {
      this.authCodeSub$.unsubscribe();
    }
  }
}

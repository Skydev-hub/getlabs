import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, ConfigurationService, DocumentType, SpecialistUser, SpecialistUserService } from '@app/ui';
import { Subscription } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { StepperComponent } from '../../../shared/components/stepper/stepper.component';


@Component({
  templateUrl: './onboarding-page.component.html',
  styleUrls: ['./onboarding-page.component.scss'],
})
export class OnboardingPageComponent implements OnInit {

  @ViewChild(StepperComponent, { static: true })
  stepper: StepperComponent;

  user: SpecialistUser;

  req$: Subscription;

  DocumentType = DocumentType;

  // Training doc URLs
  hipaaUrl: string;
  bbpUrl: string;

  // Tracks documents that were completed during this session in order to display completion screens
  documentsCompleted: DocumentType[] = [];

  constructor(
    private route: ActivatedRoute,
    private userService: SpecialistUserService,
    private auth: AuthService,
    private router: Router,
    private config: ConfigurationService,
  ) {
    this.hipaaUrl = this.config.getStaticEndPoint(environment.hipaaTrainingDoc);
    this.bbpUrl = this.config.getStaticEndPoint(environment.bbpTrainingDoc);
  }

  ngOnInit(): void {
    this.user = this.route.snapshot.data.user;

    if (!(this.user instanceof SpecialistUser)) {
      throw new TypeError('The property \'user\' must be an instance of SpecialistUser');
    }
  }

  goToFirstIncompleteStep() {
    const step = this.stepper.steps.toArray().find(s => !this.isStepCompleted(s.label));
    if (step) {
      this.stepper.selected = step;
    }
  }

  goToDashboard() {
    // Reload the authenticated user and go to the dashboard
    // This allows the guards to user the updated user record so they get let through
    this.req$ = this.auth.getAuthenticatedUser(true).subscribe(() => this.router.navigateByUrl('/care'));
  }

  onProfileSaved(user: SpecialistUser) {
    this.user = user;
    this.goToFirstIncompleteStep();
  }

  onDocumentCompleted(type: DocumentType, signature?: string, next?: boolean) {
    this.req$ = this.userService.updateDocument(this.user.id, {
      completedAt: new Date(),
      type: type,
      signature: signature || undefined,
    }).pipe(
      flatMap(() => this.userService.read(this.user.id)),
    ).subscribe((user: SpecialistUser) => {
      this.user = user;
      this.documentsCompleted.push(type);
      if (next) {
        this.goToFirstIncompleteStep();
      }
    });
  }

  onDocumentFinished() {
    this.goToFirstIncompleteStep();
  }

  isStepCompleted(label: string): boolean {
    switch (label) {
      case 'welcome':
        return true;
      case 'profile':
        return this.user.isProfileCompleted();
      // case 'eea-document':
      //   return this.user.isDocumentComplete(DocumentType.EEA);
      // case 'w4-document':
      //   return this.user.isDocumentComplete(DocumentType.W4);
      case 'hipaa':
        return this.user.isDocumentComplete(DocumentType.HIPAA);
      case 'bbp':
        return this.user.isDocumentComplete(DocumentType.BBP);
      default:
        return false;
    }
  }

}

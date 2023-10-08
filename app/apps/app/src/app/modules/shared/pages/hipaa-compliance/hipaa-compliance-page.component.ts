import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, ConfigurationService, DocumentType, User } from '@app/ui';
import { Subscription } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import { StepperComponent } from '../../components/stepper/stepper.component';


@Component({
  templateUrl: './hipaa-compliance-page.component.html',
  styleUrls: ['./hipaa-compliance-page.component.scss'],
})
export class HipaaCompliancePageComponent implements OnInit {

  @ViewChild(StepperComponent, { static: true })
  stepper: StepperComponent;

  @ViewChild('presentation', { static: true })
  presentation: ElementRef;

  form: FormGroup;

  req$: Subscription;

  user: User;

  hipaaUrl: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService,
    private config: ConfigurationService,
  ) {
    this.hipaaUrl = this.config.getStaticEndPoint(environment.hipaaTrainingDoc);
  }

  ngOnInit() {
    this.user = this.route.snapshot.data.user;

    if (!this.user) {
      throw new TypeError('The property \'user\' is required');
    }
  }

  onDocumentCompleted() {
    const service = this.auth.getUserService();

    this.req$ = service.updateDocument(this.user.id, {
      completedAt: new Date(),
      type: DocumentType.HIPAA,
    }).pipe(
      flatMap(() => service.read(this.user.id)),
    ).subscribe((user: User) => {
      this.user = user;
      this.stepper.next();
    });
  }

  goToDashboard() {
    // Reload the authenticated user and go to the dashboard
    // This allows the guards to user the updated user record so they get let through
    this.req$ = this.auth.getAuthenticatedUser(true).subscribe(() => this.router.navigateByUrl(this.auth.getPortalUrl()));
  }

}

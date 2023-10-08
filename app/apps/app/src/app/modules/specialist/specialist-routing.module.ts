import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SpecialistUser } from '@app/ui';
import { NotSignedInGuard } from '../shared/guards/not-signed-in.guard';
import { BbpCompliancePageComponent } from '../shared/pages/bbp-compliance/bbp-compliance-page.component';
import { DeactivatedPageComponent } from '../shared/pages/deactivated/deactivated-page.component';
import { HipaaCompliancePageComponent } from '../shared/pages/hipaa-compliance/hipaa-compliance-page.component';
import { MobileNumberPageComponent } from '../shared/pages/mobile-number/mobile-number-page.component';
import { SignInPageComponent } from '../shared/pages/sign-in/sign-in-page.component';
import { AppointmentResolver } from '../shared/resolvers/appointment.resolver';
import { AuthenticatedUserResolver } from '@app/ui';
import { AccountActiveGuard } from './guards/account-active.guard';
import { HipaaComplianceGuard } from './guards/hipaa-compliance.guard';
import { OnboardingCompletedGuard } from './guards/onboarding-completed.guard';
import { SpecialistPortalGuard } from './guards/specialist-portal.guard';
import { AppointmentViewPageComponent } from './pages/appointments/appointment-view/appointment-view-page.component';
import { AppointmentsPageComponent } from './pages/appointments/appointments-page.component';
import { OnboardingPageComponent } from './pages/onboarding/onboarding-page.component';
import { DocumentsPageComponent } from './pages/settings/documents/documents-page.component';
import { ProfilePageComponent } from './pages/settings/profile/profile-page.component';
import { SettingsPageComponent } from './pages/settings/settings-page.component';
import { SpecialistComponent } from './specialist.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [SpecialistPortalGuard, AccountActiveGuard],
    runGuardsAndResolvers: 'always',
    component: SpecialistComponent,
    data: {
      meta: {
        title: 'Care',
      }
    },
    children: [
      {
        path: '',
        canActivate: [OnboardingCompletedGuard, HipaaComplianceGuard],
        runGuardsAndResolvers: 'always',
        children: [
          {
            path: '',
            component: AppointmentsPageComponent,
            data: {
              meta: {
                title: 'Appointments',
              }
            },
          },
          {
            path: 'appointments/:id',
            component: AppointmentViewPageComponent,
            resolve: {
              appointment: AppointmentResolver,
            },
            data: {
              meta: {
                title: 'Appointment Details',
              }
            },
          }
        ]
      },
      {
        path: 'settings',
        children: [
          {
            path: '',
            component: SettingsPageComponent,
            data: {
              meta: {
                title: 'Account Settings',
              }
            },
          },
          {
            path: 'profile',
            component: ProfilePageComponent,
            resolve: {
              user: AuthenticatedUserResolver
            },
            data: {
              meta: {
                title: 'Personal Information',
              }
            },
          },
          {
            path: 'phone-number',
            component: MobileNumberPageComponent,
            resolve: {
              user: AuthenticatedUserResolver
            },
            data: {
              meta: {
                title: 'Phone Number',
              }
            },
          },
          {
            path: 'documents',
            component: DocumentsPageComponent,
            resolve: {
              user: AuthenticatedUserResolver
            },
            data: {
              meta: {
                title: 'Documents',
              }
            },
          }
        ]
      },
      {
        path: 'compliance',
        data: {
          meta: {
            title: 'Compliance',
          }
        },
        children: [
          {
            path: 'hipaa',
            component: HipaaCompliancePageComponent,
            resolve: {
              user: AuthenticatedUserResolver
            }
          },
          {
            path: 'bbp',
            component: BbpCompliancePageComponent,
            resolve: {
              user: AuthenticatedUserResolver
            }
          }
        ],
      },
    ]
  },
  {
    // These are pages that guards and resolvers can redirect to... Angular does not currently support
    // dynamically replacing the component for a route, so we have to use this approach.
    path: '_private',
    component: SpecialistComponent,
    children: [
      {
        path: 'deactivated',
        component: DeactivatedPageComponent,
        resolve: {
          user: AuthenticatedUserResolver
        },
        data: {
          meta: {
            title: 'Account Deactivated',
          }
        },
      },
      {
        path: 'onboarding',
        component: OnboardingPageComponent,
        resolve: {
          user: AuthenticatedUserResolver
        },
        data: {
          meta: {
            title: 'Onboarding',
          }
        },
      }
    ]
  },
  {
    path: 'sign-in',
    canActivate: [NotSignedInGuard],
    component: SpecialistComponent,
    data: {
      meta: {
        title: 'Sign In',
      }
    },
    children: [
      {
        path: '',
        component: SignInPageComponent,
        data: {
          userType: SpecialistUser,
          redirectTo: '/care'
        }
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpecialistRoutingModule {}

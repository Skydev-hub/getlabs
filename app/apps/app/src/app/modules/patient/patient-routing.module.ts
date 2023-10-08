import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BookStep } from '../../models/book-step.dto';
import { PatientUser } from '@app/ui';
import { NotSignedInGuard } from '../shared/guards/not-signed-in.guard';
import { DeactivatedPageComponent } from '../shared/pages/deactivated/deactivated-page.component';
import { MobileNumberPageComponent } from '../shared/pages/mobile-number/mobile-number-page.component';
import { NotFoundPageComponent } from '../shared/pages/not-found/not-found-page.component';
import { SignInPageComponent } from '../shared/pages/sign-in/sign-in-page.component';
import { AuthenticatedUserResolver } from '@app/ui';
import { BookLabComponent } from './components/book/lab/book-lab/book-lab.component';
import { BookCompleteComponent } from './components/book/complete/book-complete.component';
import { BookContactComponent } from './components/book/contact/book-contact.component';
import { LabContactDoctorComponent } from './components/book/lab/lab-contact-doctor/lab-contact-doctor.component';
import { BookPaymentComponent } from './components/book/payment/book-payment.component';
import { BookScheduleComponent } from './components/book/schedule/book-schedule.component';
import { RescheduleAppointmentPageComponent } from './pages/reschedule-appointment/reschedule-appointment-page.component';
import { ReferralDashboardPageComponent } from './pages/settings/referrals/referral-dashboard-page.component';
import { PatientComponent } from './patient.component';
import { AccountActiveGuard } from './guards/account-active.guard';
import { BookStepGuard } from './guards/book-step.guard';
import { PatientPortalGuard } from './guards/patient-portal.guard';
import { AppointmentStatusPageComponent } from './pages/appointment-status/appointment-status-page.component';
import { BookPageComponent } from './pages/book/book-page.component';
import { CancelAppointmentPageComponent } from './pages/cancel-appointment/cancel-appointment-page.component';
import { InsurancePageComponent } from './pages/settings/insurance/insurance-page.component';
import { ProfilePageComponent } from './pages/settings/profile/profile-page.component';
import { SettingsPageComponent } from './pages/settings/settings-page.component';
import { AppointmentStatusResolver } from './resolvers/appointment-status.resolver';
import { CompleteOutsideServiceAreaComponent } from './components/book/complete-outside-service-area/complete-outside-service-area.component';

const routes: Routes = [
  {
    path: '',
    runGuardsAndResolvers: 'always',
    component: PatientComponent,
    children: [
      {
        path: '',
        canActivate: [PatientPortalGuard, AccountActiveGuard],
        runGuardsAndResolvers: 'always',
        resolve: {
          appointment: AppointmentStatusResolver,
          user: AuthenticatedUserResolver,
        },
        children: [
          {
            path: '',
            component: AppointmentStatusPageComponent,
            data: {
              meta: {
                title: 'Appointment Status',
              }
            },
          },
          {
            path: 'cancel',
            component: CancelAppointmentPageComponent,
            data: {
              meta: {
                title: 'Cancel Appointment',
              }
            },
          },
          {
            path: 'reschedule',
            component: RescheduleAppointmentPageComponent,
            data: {
              meta: {
                title: 'Reschedule Appointment'
              }
            }
          }
        ]
      },
      {
        path: 'book',
        resolve: {
          user: AuthenticatedUserResolver
        },
        data: {
          meta: {
            title: 'Schedule At-Home Lab Appointment',
          }
        },
        component: BookPageComponent,
        children: [
          {
            path: '',
            redirectTo: BookStep.TimeslotSelection,
            // component: BookScheduleGateComponent,
            // data: {
            //   step: BookStep.LabOrderProvisioningType,
            // }
          },
          {
            path: BookStep.TimeslotSelection,
            canActivate: [BookStepGuard],
            component: BookScheduleComponent,
            data: {
              step: BookStep.TimeslotSelection
            }
          },
          {
            path: BookStep.Profile,
            canActivate: [BookStepGuard],
            component: BookContactComponent,
            data: {
              step: BookStep.Profile
            },
          },
          {
            path: BookStep.LabOrderEntry,
            canActivate: [BookStepGuard, PatientPortalGuard, AccountActiveGuard /*, LabMethodGuard*/],
            component: BookLabComponent,
            data: {
              step: BookStep.LabOrderEntry
            },
            children: [
              {
                path: '',
                component: LabContactDoctorComponent,
              }
              // {
              //   path: 'upload',
              //   component: BookUploadLabComponent,
              //   data: {
              //     labOrderType: LabOrderSeedTypes.File
              //   }
              // },
              // {
              //   path: 'text-link',
              //   component: LabTextLinkComponent
              // },
              // {
              //   path: 'contact-doctor',
              //   component: LabContactDoctorComponent,
              //   data: {
              //     labOrderType: LabOrderSeedTypes.DoctorContact
              //   }
              // }
            ]
          },
          {
            path: BookStep.Payment,
            component: BookPaymentComponent,
            canActivate: [BookStepGuard, PatientPortalGuard, AccountActiveGuard],
            data: {
              step: BookStep.Payment
            }
          },
          {
            path: BookStep.Confirmation,
            component: BookCompleteComponent,
            canActivate: [BookStepGuard, PatientPortalGuard, AccountActiveGuard],
            data: {
              step: BookStep.Confirmation,
              meta: {
                title: 'Appointment Confirmation',
              }
            }
          },
          {
            path: 'out-of-area/complete',
            component: CompleteOutsideServiceAreaComponent,
            canActivate: [BookStepGuard, PatientPortalGuard, AccountActiveGuard],
            data: {}
          },
        ]
      },
      {
        path: 'settings',
        canActivate: [PatientPortalGuard, AccountActiveGuard],
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
            path: 'insurance',
            component: InsurancePageComponent,
            resolve: {
              user: AuthenticatedUserResolver
            },
            data: {
              meta: {
                title: 'Insurance Settings',
              }
            },
          },
        ],
      },
      {
        path: 'refer',
        component: ReferralDashboardPageComponent,
        canActivate: [PatientPortalGuard, AccountActiveGuard],
        resolve: {
          user: AuthenticatedUserResolver
        },
        data: {
          meta: {
            title: 'Referral Dashboard',
          }
        },
      }
    ]
  },
  {
    // These are pages that guards and resolvers can redirect to... Angular does not currently support
    // dynamically replacing the component for a route, so we have to use this approach.
    path: '_private',
    component: PatientComponent,
    children: [
      {
        path: 'deactivated',
        component: DeactivatedPageComponent,
        resolve: {
          user: AuthenticatedUserResolver
        }
      }
    ]
  },
  {
    path: 'sign-in',
    canActivate: [NotSignedInGuard],
    component: PatientComponent,
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
          userType: PatientUser,
          redirectTo: '/',
        }
      },
    ]
  },
  {
    path: '**',
    component: PatientComponent,
    children: [
      {
        path: '',
        component: NotFoundPageComponent,
      }
    ],
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PatientRoutingModule {}

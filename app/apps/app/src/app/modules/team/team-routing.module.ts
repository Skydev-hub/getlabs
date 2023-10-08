import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticatedUserResolver, StaffUser } from '@app/ui';
import { NotSignedInGuard } from '../shared/guards/not-signed-in.guard';
import { DeactivatedPageComponent } from '../shared/pages/deactivated/deactivated-page.component';
import { DeniedPageComponent } from '../shared/pages/denied/denied-page.component';
import { HipaaCompliancePageComponent } from '../shared/pages/hipaa-compliance/hipaa-compliance-page.component';
import { MobileNumberPageComponent } from '../shared/pages/mobile-number/mobile-number-page.component';
import { SignInPageComponent } from '../shared/pages/sign-in/sign-in-page.component';
import { AppointmentResolver } from '../shared/resolvers/appointment.resolver';
import { MarketResolver } from '../shared/resolvers/market.resolver';
import { PatientResolver } from '../shared/resolvers/patient-resolver.service';
import { ServiceAreaResolver } from '../shared/resolvers/service-area.resolver';
import { SpecialistResolver } from '../shared/resolvers/specialist.resolver';
import { StaffResolver } from '../shared/resolvers/staff.resolver';
import { AccessLevelGuard } from './guards/access-level.guard';
import { AccountActiveGuard } from './guards/account-active.guard';
import { HipaaComplianceGuard } from './guards/hipaa-compliance.guard';
import { TeamPortalGuard } from './guards/team-portal-guard.service';
import { AppointmentRebookPageComponent } from './pages/appointments/appointment-rebook/appointment-rebook-page.component';
import { AppointmentViewPageComponent } from './pages/appointments/appointment-view/appointment-view-page.component';
import { AppointmentsPageComponent } from './pages/appointments/appointments-page.component';
import { MarketEditSchedulePageComponent } from './pages/markets/market-edit-schedule/market-edit-schedule-page.component';
import { MarketEditPageComponent } from './pages/markets/market-edit/market-edit-page.component';
import { MarketViewPageComponent } from './pages/markets/market-view/market-view-page.component';
import { MarketsPageComponent } from './pages/markets/markets-page.component';
import { ServiceAreaEditPageComponent } from './pages/markets/service-areas/service-area-edit/service-area-edit-page.component';
import { ServiceAreaViewPageComponent } from './pages/markets/service-areas/service-area-view/service-area-view-page.component';
import { PatientEditPageComponent } from './pages/patients/patient-edit/patient-edit-page.component';
import { PatientViewPageComponent } from './pages/patients/patient-view/patient-view-page.component';
import { PatientsPageComponent } from './pages/patients/patients-page.component';
import { DocumentsPageComponent } from './pages/settings/documents/documents-page.component';
import { ProfilePageComponent } from './pages/settings/profile/profile-page.component';
import { SettingsPageComponent } from './pages/settings/settings-page.component';
import { SpecialistEditSchedulePageComponent } from './pages/specialists/specialist-edit-schedule/specialist-edit-schedule-page.component';
import { SpecialistEditPageComponent } from './pages/specialists/specialist-edit/specialist-edit-page.component';
import { SpecialistViewPageComponent } from './pages/specialists/specialist-view/specialist-view-page.component';
import { SpecialistsPageComponent } from './pages/specialists/specialists-page.component';
import { TeamMemberEditPageComponent } from './pages/team-members/team-member-edit/team-member-edit-page.component';
import { TeamMemberViewPageComponent } from './pages/team-members/team-member-view/team-member-view-page.component';
import { TeamMembersPageComponent } from './pages/team-members/team-members-page.component';
import { TeamComponent } from './team.component';
import { LabsPageComponent } from './pages/labs/labs-page.component';
import { LabViewPageComponent } from './pages/labs/lab-view/lab-view-page.component';
import { LabLocationResolver } from '../shared/resolvers/lab-location.resolver';
import { LabEditPageComponent } from './pages/labs/lab-edit/lab-edit-page.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [TeamPortalGuard, AccountActiveGuard],
    runGuardsAndResolvers: 'always',
    component: TeamComponent,
    data: {
      meta: {
        title: 'Team'
      }
    },
    children: [
      {
        path: '',
        canActivate: [HipaaComplianceGuard],
        children: [
          {
            path: '',
            component: AppointmentsPageComponent,
            data: {
              meta: {
                title: 'Appointments'
              }
            }
          },
          {
            path: 'appointments',
            data: {
              meta: {
                title: 'Appointments'
              }
            },
            children: [
              {
                path: '',
                component: AppointmentsPageComponent
              },
              {
                path: ':id',
                runGuardsAndResolvers: 'always',
                resolve: {
                  appointment: AppointmentResolver
                },
                data: {
                  meta: {
                    title: 'Appointment Details'
                  }
                },
                children: [
                  {
                    path: '',
                    component: AppointmentViewPageComponent
                  },
                  {
                    path: 'rebook',
                    component: AppointmentRebookPageComponent,
                    data: {
                      meta: {
                        title: 'Rebook Appointment'
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            path: 'patients',
            data: {
              meta: {
                title: 'Patients'
              }
            },
            children: [
              {
                path: '',
                component: PatientsPageComponent
              },
              {
                path: 'create',
                component: PatientEditPageComponent,
                data: {
                  meta: {
                    title: 'New Patient'
                  }
                }
              },
              {
                path: ':id',
                runGuardsAndResolvers: 'always',
                resolve: {
                  user: PatientResolver
                },
                data: {
                  meta: {
                    title: 'Patient Profile'
                  }
                },
                children: [
                  {
                    path: '',
                    component: PatientViewPageComponent
                  },
                  {
                    path: 'edit',
                    component: PatientEditPageComponent,
                    data: {
                      meta: {
                        title: 'Edit Patient Profile'
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            path: 'specialists',
            data: {
              meta: {
                title: 'Care Specialists'
              }
            },
            children: [
              {
                path: '',
                component: SpecialistsPageComponent
              },
              {
                path: 'create',
                component: SpecialistEditPageComponent,
                data: {
                  meta: {
                    title: 'New Care Specialist'
                  }
                }
              },
              {
                path: ':id',
                runGuardsAndResolvers: 'always',
                resolve: {
                  user: SpecialistResolver
                },
                data: {
                  meta: {
                    title: 'Care Specialist Profile'
                  }
                },
                children: [
                  {
                    path: '',
                    component: SpecialistViewPageComponent
                  },
                  {
                    path: 'edit',
                    component: SpecialistEditPageComponent,
                    data: {
                      meta: {
                        title: 'Edit Care Specialist Profile'
                      }
                    }
                  },
                  {
                    path: 'schedule',
                    children: [
                      {
                        path: 'edit',
                        component: SpecialistEditSchedulePageComponent,
                        data: {
                          meta: {
                            title: 'Edit Care Specialist Schedule'
                          }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          },
          {
            path: 'team-members',
            canActivate: [AccessLevelGuard],
            data: {
              meta: {
                title: 'Team'
              }
            },
            children: [
              {
                path: '',
                component: TeamMembersPageComponent
              },
              {
                path: 'create',
                component: TeamMemberEditPageComponent,
                data: {
                  meta: {
                    title: 'New Team Member'
                  }
                }
              },
              {
                path: ':id',
                runGuardsAndResolvers: 'always',
                resolve: {
                  user: StaffResolver
                },
                data: {
                  meta: {
                    title: 'Team Member Profile'
                  }
                },
                children: [
                  {
                    path: '',
                    component: TeamMemberViewPageComponent
                  },
                  {
                    path: 'edit',
                    component: TeamMemberEditPageComponent,
                    data: {
                      meta: {
                        title: 'Edit Team Member Profile'
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            path: 'labs',
            data: {
              meta: {
                title: 'Lab Locations'
              }
            },
            children: [
              {
                path: '',
                component: LabsPageComponent
              },
              {
                path: 'create',
                component: LabEditPageComponent,
                data: {
                  meta: {
                    title: 'New Lab Location'
                  }
                }
              },
              {
                path: ':id',
                runGuardsAndResolvers: 'always',
                resolve: {
                  lab: LabLocationResolver
                },
                data: {
                  meta: {
                    title: 'Lab Location Details'
                  }
                },
                children: [
                  {
                    path: '',
                    component: LabViewPageComponent
                  },
                  {
                    path: 'edit',
                    component: LabEditPageComponent,
                    data: {
                      meta: {
                        title: 'Edit Lab Location'
                      }
                    }
                  }
                ]
              }
            ]
          },
          {
            path: 'markets',
            data: {
              meta: {
                title: 'Markets'
              }
            },
            children: [
              {
                path: '',
                component: MarketsPageComponent
              },
              {
                path: 'create',
                component: MarketEditPageComponent,
                data: {
                  meta: {
                    title: 'New Market'
                  }
                }
              },
              {
                path: ':id',
                runGuardsAndResolvers: 'always',
                resolve: {
                  market: MarketResolver
                },
                data: {
                  meta: {
                    title: 'Market Details'
                  }
                },
                children: [
                  {
                    path: '',
                    component: MarketViewPageComponent
                  },
                  {
                    path: 'edit',
                    component: MarketEditPageComponent,
                    data: {
                      meta: {
                        title: 'Edit Market'
                      }
                    }
                  },
                  {
                    path: 'schedule',
                    children: [
                      {
                        path: 'edit',
                        component: MarketEditSchedulePageComponent,
                        data: {
                          meta: {
                            title: 'Edit Market Schedule'
                          }
                        }
                      }
                    ]
                  }
                ]
              },
              {
                path: 'service-areas',
                data: {
                  meta: {
                    title: 'Service Areas'
                  }
                },
                children: [
                  {
                    path: 'create',
                    component: ServiceAreaEditPageComponent,
                    data: {
                      meta: {
                        title: 'New Service Area'
                      }
                    }
                  },
                  {
                    path: ':id',
                    runGuardsAndResolvers: 'always',
                    resolve: {
                      serviceArea: ServiceAreaResolver
                    },
                    data: {
                      meta: {
                        title: 'Service Area Details'
                      }
                    },
                    children: [
                      {
                        path: '',
                        component: ServiceAreaViewPageComponent
                      },
                      {
                        path: 'edit',
                        component: ServiceAreaEditPageComponent,
                        data: {
                          meta: {
                            title: 'Edit Service Area'
                          }
                        }
                      }
                    ]
                  }
                ]
              }
            ]
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
                title: 'Account Settings'
              }
            }
          },
          {
            path: 'profile',
            component: ProfilePageComponent,
            resolve: {
              user: AuthenticatedUserResolver
            },
            data: {
              meta: {
                title: 'Personal Information'
              }
            }
          },
          {
            path: 'phone-number',
            component: MobileNumberPageComponent,
            resolve: {
              user: AuthenticatedUserResolver
            },
            data: {
              meta: {
                title: 'Phone Number'
              }
            }
          },
          {
            path: 'documents',
            component: DocumentsPageComponent,
            resolve: {
              user: AuthenticatedUserResolver
            },
            data: {
              meta: {
                title: 'Documents'
              }
            }
          }
        ]
      },
      {
        path: 'compliance',
        data: {
          meta: {
            title: 'Compliance'
          }
        },
        children: [
          {
            path: 'hipaa',
            component: HipaaCompliancePageComponent,
            resolve: {
              user: AuthenticatedUserResolver
            }
          }
        ]
      }
    ]
  },
  {
    // These are pages that guards and resolvers can redirect to... Angular does not currently support
    // dynamically replacing the component for a route, so we have to use this approach.
    path: '_private',
    component: TeamComponent,
    children: [
      {
        path: 'deactivated',
        component: DeactivatedPageComponent,
        data: {
          meta: {
            title: 'Account Deactivated'
          }
        }
      },
      {
        path: 'denied',
        component: DeniedPageComponent,
        data: {
          meta: {
            title: 'Access Denied'
          }
        }
      }
    ]
  },
  {
    path: 'sign-in',
    canActivate: [NotSignedInGuard],
    component: TeamComponent,
    data: {
      meta: {
        title: 'Sign In'
      }
    },
    children: [
      {
        path: '',
        component: SignInPageComponent,
        data: {
          userType: StaffUser,
          redirectTo: '/team'
        }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TeamRoutingModule {}

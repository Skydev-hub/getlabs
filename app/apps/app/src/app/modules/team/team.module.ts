import { NgModule } from '@angular/core';
import { PatientModule } from '../patient/patient.module';
import { SharedModule } from '../shared/shared.module';
import { AccessLevelComponent } from './components/access-level/access-level.component';
import { AppointmentCollectionRequirementsFormComponent } from './components/appointment-collection-requirements-form/appointment-collection-requirements-form.component';
import { AppointmentSetupStepsComponent } from './components/appointment-setup-steps/appointment-setup-steps.component';
import { IssueCreditDialogComponent } from './components/credits/issue-credit-dialog/issue-credit-dialog.component';
import { IssueCreditComponent } from './components/credits/issue-credit/issue-credit.component';
import { RevokeCreditDialogComponent } from './components/credits/revoke-credit-dialog/revoke-credit-dialog.component';
import { RevokeCreditComponent } from './components/credits/revoke-credit/revoke-credit.component';
import { DeleteLabOrderDetailsDialogComponent } from './components/delete-lab-order-details-dialog/delete-lab-order-details-dialog.component';
import { AccountDeactivationDialogComponent } from './components/dialog/account-deactivation-dialog/account-deactivation-dialog.component';
import { AccountReactivationDialogComponent } from './components/dialog/account-reactivation-dialog/account-reactivation-dialog.component';
import { AppointmentCancelConfirmationDialogComponent } from './components/dialog/appointment-cancel-dialog-confirmation/appointment-cancel-confirmation-dialog.component';
import { AppointmentCancelDialogComponent } from './components/dialog/appointment-cancel-dialog/appointment-cancel-dialog.component';
import { AppointmentRefundConfirmationDialogComponent } from './components/dialog/appointment-refund-dialog-confirmation/appointment-refund-confirmation-dialog.component';
import { AppointmentRefundDialogComponent } from './components/dialog/appointment-refund-dialog/appointment-refund-dialog.component';
import { AssignSpecialistDialogComponent } from './components/dialog/assign-specialist-dialog/assign-specialist-dialog.component';
import { CreateSpecialistDialogComponent } from './components/dialog/create-specialist-dialog/create-specialist-dialog.component';
import { EditLabOrderDetailsDialogComponent } from './components/edit-lab-order-details-dialog/edit-lab-order-details-dialog.component';
import { AppointmentRequiredSampleInputComponent } from './components/inputs/appointment-required-sample-input/appointment-required-sample-input.component';
import { BlackoutPeriodsInputComponent } from './components/inputs/blackout-periods-input/blackout-periods-input.component';
import { LabOrderPreferenceComponent, LabOrderPreferenceTemplateDirective } from './components/lab-order-preference/lab-order-preference.component';
import { LabSelectionFormComponent } from './components/lab-selection-form/lab-selection-form.component';
import { MarketDetailsFormComponent } from './components/market-details-form/market-details-form.component';
import { MarketDetailsComponent } from './components/market-details/market-details.component';
import { MarketListComponent } from './components/market-list/market-list.component';
import { MarketScheduleFormComponent } from './components/market-schedule-form/market-schedule-form.component';
import { MarketScheduleComponent } from './components/market-schedule/market-schedule.component';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientProfileFormComponent } from './components/patient-profile-form/patient-profile-form.component';
import { PatientProfileComponent } from './components/patient-profile/patient-profile.component';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { ServiceAreaDetailsFormComponent } from './components/service-area-details-form/service-area-details-form.component';
import { ServiceAreaDetailsComponent } from './components/service-area-details/service-area-details.component';
import { ServiceAreaListComponent } from './components/service-area-list/service-area-list.component';
import { SpecialistListComponent } from './components/specialist-list/specialist-list.component';
import { SpecialistProfileFormComponent } from './components/specialist-profile-form/specialist-profile-form.component';
import { SpecialistProfileComponent } from './components/specialist-profile/specialist-profile.component';
import { SpecialistScheduleFormComponent } from './components/specialist-schedule-form/specialist-schedule-form.component';
import { SpecialistScheduleComponent } from './components/specialist-schedule/specialist-schedule.component';
import { SpecialistStatusMessageComponent } from './components/status-message/specialist-status-message.component';
import { TeamMemberListComponent } from './components/team-member-list/team-member-list.component';
import { TeamMemberProfileFormComponent } from './components/team-member-profile-form/team-member-profile-form.component';
import { TeamMemberProfileComponent } from './components/team-member-profile/team-member-profile.component';
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
import { AccountStatusService } from './services/account-status.service';
import { TeamRoutingModule } from './team-routing.module';
import { TeamComponent } from './team.component';
import { LabsPageComponent } from './pages/labs/labs-page.component';
import { LabListComponent } from './components/lab-list/lab-list.component';
import { LabViewPageComponent } from './pages/labs/lab-view/lab-view-page.component';
import { LabDetailsComponent } from './components/lab-details/lab-details.component';
import { LabEditPageComponent } from './pages/labs/lab-edit/lab-edit-page.component';
import { LabDetailsFormComponent } from './components/lab-details-form/lab-details-form.component';
import { LabMarketsComponent } from './components/lab-details/lab-markets/lab-markets.component';
import { SpecialistMarketsComponent } from './components/specialist-profile/specialist-markets/specialist-markets.component';
import { TeamMemberMarketsComponent } from './components/team-member-profile/team-member-markets/team-member-markets.component';
import { LabAccountListComponent } from './components/lab-account-list/lab-account-list.component';

@NgModule({
  declarations: [
    // Layout
    TeamComponent,

    // Pages
    AppointmentsPageComponent,
    AppointmentViewPageComponent,
    AppointmentRebookPageComponent,
    LabsPageComponent,
    LabViewPageComponent,
    MarketsPageComponent,
    MarketEditPageComponent,
    MarketEditSchedulePageComponent,
    MarketViewPageComponent,
    PatientsPageComponent,
    PatientEditPageComponent,
    PatientViewPageComponent,
    ServiceAreaViewPageComponent,
    ServiceAreaEditPageComponent,
    SpecialistsPageComponent,
    SpecialistEditPageComponent,
    SpecialistEditSchedulePageComponent,
    SpecialistViewPageComponent,
    TeamMembersPageComponent,
    TeamMemberEditPageComponent,
    TeamMemberViewPageComponent,
    SettingsPageComponent,
    ProfilePageComponent,
    DocumentsPageComponent,

    // Components
    AccessLevelComponent,
    MarketListComponent,
    MarketDetailsComponent,
    MarketDetailsFormComponent,
    MarketScheduleFormComponent,
    MarketScheduleComponent,
    PatientListComponent,
    PatientProfileComponent,
    PatientProfileFormComponent,
    ServiceAreaDetailsComponent,
    ServiceAreaDetailsFormComponent,
    SpecialistListComponent,
    SpecialistProfileComponent,
    SpecialistProfileFormComponent,
    TeamMemberListComponent,
    TeamMemberProfileComponent,
    TeamMemberProfileFormComponent,
    ProfileFormComponent,
    AppointmentRequiredSampleInputComponent,
    SpecialistScheduleComponent,
    BlackoutPeriodsInputComponent,
    SpecialistScheduleFormComponent,
    LabSelectionFormComponent,
    AppointmentCollectionRequirementsFormComponent,
    AppointmentSetupStepsComponent,
    SpecialistStatusMessageComponent,
    IssueCreditComponent,
    IssueCreditDialogComponent,
    RevokeCreditComponent,
    RevokeCreditDialogComponent,
    LabOrderPreferenceTemplateDirective,
    LabOrderPreferenceComponent,
    LabListComponent,
    LabDetailsComponent,
    LabEditPageComponent,
    LabDetailsFormComponent,
    LabMarketsComponent,
    ServiceAreaListComponent,
    LabAccountListComponent,
    SpecialistMarketsComponent,
    TeamMemberMarketsComponent,

    // Dialogs
    CreateSpecialistDialogComponent,
    AccountDeactivationDialogComponent,
    AccountReactivationDialogComponent,
    AppointmentRefundDialogComponent,
    AppointmentRefundConfirmationDialogComponent,
    AppointmentCancelDialogComponent,
    AppointmentCancelConfirmationDialogComponent,
    EditLabOrderDetailsDialogComponent,
    DeleteLabOrderDetailsDialogComponent,
    AssignSpecialistDialogComponent
  ],
  entryComponents: [
    // Dialogs
    CreateSpecialistDialogComponent,
    AccountDeactivationDialogComponent,
    AccountReactivationDialogComponent,
    AppointmentRefundDialogComponent,
    AppointmentRefundConfirmationDialogComponent,
    AppointmentCancelDialogComponent,
    AppointmentCancelConfirmationDialogComponent,
    EditLabOrderDetailsDialogComponent,
    DeleteLabOrderDetailsDialogComponent,
    IssueCreditDialogComponent,
    RevokeCreditDialogComponent,
    AssignSpecialistDialogComponent
  ],
  providers: [AccountStatusService],
  imports: [SharedModule, TeamRoutingModule, PatientModule]
})
export class TeamModule {}

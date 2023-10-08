import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgModule } from '@angular/core';
import { UiModule } from '@app/ui';
import { BookingTimeslotIndicatorComponent } from 'apps/app/src/app/modules/patient/components/booking-timeslot-indicator/booking-timeslot-indicator.component';
import { SharedModule } from '../shared/shared.module';
import { AppointmentStatusComponent } from './components/appointment-status/appointment-status.component';
import { BookLabComponent } from './components/book/lab/book-lab/book-lab.component';
import { BookCompleteComponent } from './components/book/complete/book-complete.component';
import { BookContactComponent } from './components/book/contact/book-contact.component';
import { LabContactDoctorComponent } from './components/book/lab/lab-contact-doctor/lab-contact-doctor.component';
import { LabTextLinkComponent } from './components/book/lab/lab-text-link/lab-text-link.component';
import { BookPaymentComponent } from './components/book/payment/book-payment.component';
import { PrivacyBlockComponent } from './components/book/privacy-block/privacy-block.component';
import { BookScheduleGateComponent } from './components/book/schedule-gate/book-schedule-gate.component';
import { BookScheduleComponent } from './components/book/schedule/book-schedule.component';
import { BookUploadLabComponent } from './components/book/lab/upload-lab/book-upload-lab.component';
import { CreditCardFormComponent } from './components/credit-card-form/credit-card-form.component';
import { DoctorContactInfoComponent } from './components/doctor-contact-info/doctor-contact-info.component';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { LabMethodGuard } from './guards/lab-method.guard';
import { RescheduleAppointmentPageComponent } from './pages/reschedule-appointment/reschedule-appointment-page.component';
import { ReferralDashboardPageComponent } from './pages/settings/referrals/referral-dashboard-page.component';
import { PatientRoutingModule } from './patient-routing.module';
import { PatientComponent } from './patient.component';
import { AppointmentStatusPageComponent } from './pages/appointment-status/appointment-status-page.component';
import { BookPageComponent } from './pages/book/book-page.component';
import { CancelAppointmentPageComponent } from './pages/cancel-appointment/cancel-appointment-page.component';
import { DashboardPageComponent } from './pages/dashboard/dashboard-page.component';
import { InsurancePageComponent } from './pages/settings/insurance/insurance-page.component';
import { ProfilePageComponent } from './pages/settings/profile/profile-page.component';
import { SettingsPageComponent } from './pages/settings/settings-page.component';
import { ProfileGuardianDialogComponent } from './components/profile-guardian-dialog/profile-guardian-dialog.component';
import { AddressAutocompleteFormComponent } from './components/address-autocomplete-form/address-autocomplete-form.component';
import { CompleteOutsideServiceAreaComponent } from './components/book/complete-outside-service-area/complete-outside-service-area.component';
import { ShareReferralComponent } from './components/share/share-referral/share-referral.component';

@NgModule({
  declarations: [
    // Layout
    PatientComponent,

    // Pages
    DashboardPageComponent,
    AppointmentStatusPageComponent,
    CancelAppointmentPageComponent,
    BookPageComponent,
    SettingsPageComponent,
    ProfilePageComponent,
    InsurancePageComponent,

    // Components
    ProfileFormComponent,
    CreditCardFormComponent,
    BookScheduleGateComponent,
    BookContactComponent,
    BookScheduleComponent,
    BookUploadLabComponent,
    BookPaymentComponent,
    BookCompleteComponent,
    AppointmentStatusComponent,
    LabTextLinkComponent,
    BookLabComponent,
    LabContactDoctorComponent,
    PrivacyBlockComponent,
    RescheduleAppointmentPageComponent,
    DoctorContactInfoComponent,
    BookingTimeslotIndicatorComponent,
    ReferralDashboardPageComponent,
    ProfileGuardianDialogComponent,
    AddressAutocompleteFormComponent,
    CompleteOutsideServiceAreaComponent,
    ShareReferralComponent,
  ],
  entryComponents: [
    ProfileGuardianDialogComponent,
  ],
  imports: [
    SharedModule,
    PatientRoutingModule,
    UiModule,
    ClipboardModule
  ],
  exports: [
    DoctorContactInfoComponent
  ],
  providers: [
    LabMethodGuard,
  ]
})
export class PatientModule {}

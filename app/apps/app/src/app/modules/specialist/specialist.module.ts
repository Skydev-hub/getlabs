import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { DocumentSigningRequestComponent } from './components/document-signing-request/document-signing-request.component';
import { ProfileFormComponent } from './components/profile-form/profile-form.component';
import { AppointmentViewPageComponent } from './pages/appointments/appointment-view/appointment-view-page.component';
import { AppointmentsPageComponent } from './pages/appointments/appointments-page.component';
import { OnboardingPageComponent } from './pages/onboarding/onboarding-page.component';
import { DocumentsPageComponent } from './pages/settings/documents/documents-page.component';
import { ProfilePageComponent } from './pages/settings/profile/profile-page.component';
import { SettingsPageComponent } from './pages/settings/settings-page.component';
import { SpecialistRoutingModule } from './specialist-routing.module';
import { SpecialistComponent } from './specialist.component';

@NgModule({
  declarations: [
    // Layout
    SpecialistComponent,

    // Pages
    OnboardingPageComponent,
    SettingsPageComponent,
    AppointmentsPageComponent,
    AppointmentViewPageComponent,
    ProfilePageComponent,
    DocumentsPageComponent,

    // Components
    ProfileFormComponent,
    DocumentSigningRequestComponent,
  ],
  imports: [
    SharedModule,
    SpecialistRoutingModule,
  ]
})
export class SpecialistModule {}

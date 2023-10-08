import { CdkAccordionModule } from '@angular/cdk/accordion';
import { PlatformModule } from '@angular/cdk/platform';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { CdkTableModule } from '@angular/cdk/table';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_RIPPLE_GLOBAL_OPTIONS, MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { UiModule } from '@app/ui';
import { UppercaseInputDirective } from './directives/uppercase-input.directive';
import { PdfViewerModule } from 'ng2-pdf-viewer';
import { NgxCurrencyModule } from 'ngx-currency';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { AccountStatusComponent } from './components/account-status/account-status.component';
import { ActiveStatusComponent } from './components/active-status/active-status.component';
import { AppointmentMapComponent } from './components/appointment-map/appointment-map.component';
import { AppointmentProgressStepsComponent } from './components/appointment-progress-steps/appointment-progress-steps.component';
import { AppointmentSamplesPropertyCheckboxComponent } from './components/appointment-progress-steps/appointment-samples-property-checkbox/appointment-samples-property-checkbox.component';
import { AppointmentSamplesTableComponent } from './components/appointment-progress-steps/appointment-samples-table/appointment-samples-table.component';
import { AppointmentSchedulerComponent } from './components/appointment-scheduler/appointment-scheduler.component';
import { AppointmentStatusTextComponent } from './components/appointment-status-text/appointment-status-text.component';
import { AppointmentStepComponent } from './components/appointment-step/appointment-step.component';
import { AppointmentsTableComponent } from './components/appointments-table/appointments-table.component';
import { AuthCodeFormComponent } from './components/auth-code-form/auth-code-form.component';
import { BbpExamComponent } from './components/bbp-exam/bbp-exam.component';
import { CollectionRequirementsComponent } from './components/collection-requirements/collection-requirements.component';
import { CollectionSampleComponent } from './components/collection-sample/collection-sample.component';
import { ComplianceStatusComponent } from './components/compliance-status/compliance-status.component';
import { CyclicalNavigatorComponent } from './components/cyclical-navigator/cyclical-navigator.component';
import { DateTimeSelectorComponent } from './components/date-time-selector/date-time-selector.component';
import { DatepickerComponent } from './components/datepicker/datepicker.component';
import { DeliveryVerificationFormComponent } from './components/delivery-verification-form/delivery-verification-form.component';
import { AppointmentSampleUncollectedDialogComponent } from './components/dialog/appointment-sample-uncollected-dialog/appointment-sample-uncollected-dialog.component';
import { AppointmentSampleUnprocessedDialogComponent } from './components/dialog/appointment-sample-unprocessed-dialog/appointment-sample-unprocessed-dialog.component';
import { DoubleBookingConfirmationDialogComponent } from './components/dialog/double-booking-confirmation-dialog/double-booking-confirmation-dialog.component';
import { ErrorDialogComponent } from './components/dialog/error-dialog/error-dialog.component';
import { InactivityDialogComponent } from './components/dialog/inactivity-dialog/inactivity-dialog.component';
import { PriorityTimeslotDialogComponent } from './components/dialog/priority-timeslot-dialog/priority-timeslot-dialog.component';
import { ShowBadgeDialogComponent } from './components/dialog/show-badge-dialog/show-badge-dialog.component';
import { DocumentCardComponent } from './components/document-card/document-card.component';
import { DocumentsStatusComponent } from './components/documents-status/documents-status.component';
import { DragDropFileUploadComponent } from './components/drag-drop-file-upload/drag-drop-file-upload.component';
import { FileDownloadAnchorComponent } from './components/file-download-anchor/file-download-anchor.component';
import { FloatingNavComponent, FloatingNavItemDirective } from './components/floating-nav/floating-nav.component';
import { FormGroupComponent } from './components/form/form-group/form-group.component';
import { AvailabilityDayInputComponent } from './components/form/input/availability-day-input/availability-day-input.component';
import { DateInputComponent } from './components/form/input/date-input/date-input.component';
import { DateRangeInputComponent } from './components/form/input/date-range-input/date-range-input.component';
import { DobInputComponent } from './components/form/input/dob-input/dob-input.component';
import { FileInputComponent } from './components/form/input/file-input/file-input.component';
import { MultipleFileInputComponent } from './components/form/input/multiple-file-input/multiple-file-input.component';
import { PriceInputComponent } from './components/form/input/price-input/price-input.component';
import { RadioGroupDirective, RadioInputComponent } from './components/form/input/radio-input/radio-input.component';
import { SimpleDobInputComponent } from './components/form/input/simple-dob-input/simple-dob-input.component';
import { USStateInputComponent } from './components/form/input/us-state-input/us-state-input.component';
import { HeaderComponent } from './components/header/header.component';
import { HipaaExamComponent } from './components/hipaa-exam/hipaa-exam.component';
import { InstructionBarComponent } from './components/instruction-bar/instruction-bar.component';
import { InsuranceCardComponent } from './components/insurance-card/insurance-card.component';
import { LabCompanySelectComponent } from './components/lab-company-select/lab-company-select.component';
import { LabOrderRepeaterComponent } from './components/lab-order-repeater/lab-order-repeater.component';
import { LightboxComponent } from './components/lightbox/lightbox.component';
import { MarketSelectorButtonComponent } from './components/market-selector/market-selector-button/market-selector-button.component';
import { MarketSelectorDialogComponent } from './components/market-selector/market-selector-dialog/market-selector-dialog.component';
import { MobileNumberFormComponent } from './components/mobile-number-form/mobile-number-form.component';
import { PanelComponent } from './components/panel/panel.component';
import { PdfViewerComponent } from './components/pdf-viewer/pdf-viewer.component';
import { QuizComponent } from './components/quiz/quiz.component';
import { SchedulerSlotsComponent } from './components/scheduler/scheduler-slots/scheduler-slots.component';
import { SchedulerComponent } from './components/scheduler/scheduler.component';
import { SectionHeaderComponent } from './components/section-header/section-header.component';
import { SignInComponent } from './components/sign-in/sign-in.component';
import { SignaturePadComponent } from './components/signature-pad/signature-pad.component';
import { StepperHeaderComponent } from './components/stepper/stepper-header.component';
import { StepperComponent } from './components/stepper/stepper.component';
import { TabComponent } from './components/tabs/tab/tab.component';
import { TabsComponent } from './components/tabs/tabs.component';
import { TimeSelectorComponent } from './components/time-selector/time-selector.component';
import { DragDropUploadDirective } from './directives/drag-drop-upload.directive';
import { StepIndexerDirective } from './directives/step-indexer.directive';
import { HttpErrorInterceptor } from './interceptors/http-error-interceptor.service';
import { MarketInterceptorService } from './interceptors/market-interceptor.service';
import { BbpCompliancePageComponent } from './pages/bbp-compliance/bbp-compliance-page.component';
import { BlankPageComponent } from './pages/blank/blank-page.component';
import { DeactivatedPageComponent } from './pages/deactivated/deactivated-page.component';
import { DeniedPageComponent } from './pages/denied/denied-page.component';
import { HipaaCompliancePageComponent } from './pages/hipaa-compliance/hipaa-compliance-page.component';
import { MobileNumberPageComponent } from './pages/mobile-number/mobile-number-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';
import { SignInPageComponent } from './pages/sign-in/sign-in-page.component';
import { AmPmPipe } from './pipes/am-pm.pipe';
import { DateDistancePipe } from './pipes/date-distance.pipe';
import { DateTzPipe } from './pipes/date-tz.pipe';
import { DatesPipe } from './pipes/dates.pipe';
import { DirectionsUrlPipe } from './pipes/directions-url.pipe';
import { DiscountPipe } from './pipes/discount.pipe';
import { DobPipe } from './pipes/dob.pipe';
import { EncodeUriElementPipe } from './pipes/encode-uri-element.pipe';
import { FileSizePipe } from './pipes/file-size.pipe';
import { GenderPipe } from './pipes/gender.pipe';
import { IterablePipe } from './pipes/iterable.pipe';
import { PhonePipe } from './pipes/phone.pipe';
import { PricePipe } from './pipes/price.pipe';
import { RedactPipe } from './pipes/redact.pipe';
import { AddressWarningDialogComponent } from './components/dialog/address-warning-dialog/address-warning-dialog.component';
import { IfAddressIsLabDirective } from './directives/if-address-is-lab.directive';
import { AOrAnPipe } from './pipes/a-or-an.pipe';

const thirdPartyModules = [
  NgxCurrencyModule,
  InfiniteScrollModule,
  PdfViewerModule,
  CdkAccordionModule,
  CdkStepperModule,
  CdkTableModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatSnackBarModule,
  MatProgressBarModule,
  MatProgressSpinnerModule,
  MatButtonToggleModule,
  MatDialogModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatTooltipModule,
  MatCheckboxModule,
  MatMenuModule,
  PlatformModule
];

@NgModule({
  imports: [CommonModule, RouterModule, ReactiveFormsModule, GoogleMapsModule, UiModule, ...thirdPartyModules],
  declarations: [
    // Pages
    SignInPageComponent,
    MobileNumberPageComponent,
    DeactivatedPageComponent,
    DeniedPageComponent,
    HipaaCompliancePageComponent,
    BbpCompliancePageComponent,
    BlankPageComponent,
    NotFoundPageComponent,

    // Components
    HeaderComponent,
    // FooterComponent,
    StepperHeaderComponent,
    SignInComponent,
    // FormElementComponent,
    FileInputComponent,
    AvailabilityDayInputComponent,
    AppointmentsTableComponent,
    CyclicalNavigatorComponent,
    ComplianceStatusComponent,
    AccountStatusComponent,
    ActiveStatusComponent,
    SectionHeaderComponent,
    FormGroupComponent,
    PanelComponent,
    // AvatarComponent,
    MobileNumberFormComponent,
    AuthCodeFormComponent,
    StepperComponent,
    DobInputComponent,
    USStateInputComponent,
    RadioInputComponent,
    InsuranceCardComponent,
    SchedulerComponent,
    SchedulerSlotsComponent,
    AppointmentStatusTextComponent,
    InstructionBarComponent,
    CollectionRequirementsComponent,
    CollectionSampleComponent,
    DocumentCardComponent,
    HipaaExamComponent,
    BbpExamComponent,
    LightboxComponent,
    TabsComponent,
    TabComponent,
    FloatingNavComponent,
    PdfViewerComponent,
    DatepickerComponent,
    QuizComponent,
    DateInputComponent,
    DateRangeInputComponent,
    AppointmentStepComponent,
    AppointmentProgressStepsComponent,
    AppointmentSamplesTableComponent,
    AppointmentSamplesPropertyCheckboxComponent,
    SignaturePadComponent,
    DeliveryVerificationFormComponent,
    DragDropFileUploadComponent,
    MultipleFileInputComponent,
    DocumentsStatusComponent,
    SimpleDobInputComponent,
    LabCompanySelectComponent,
    AppointmentSchedulerComponent,
    AppointmentMapComponent,
    LabOrderRepeaterComponent,
    FileDownloadAnchorComponent,
    TimeSelectorComponent,
    DateTimeSelectorComponent,
    MarketSelectorButtonComponent,
    PriceInputComponent,

    // Directives
    FloatingNavItemDirective,
    RadioGroupDirective,
    DragDropUploadDirective,
    StepIndexerDirective,
    UppercaseInputDirective,
    IfAddressIsLabDirective,

    // Pipes
    FileSizePipe,
    DateTzPipe,
    DateDistancePipe,
    DatesPipe,
    PhonePipe,
    GenderPipe,
    DobPipe,
    DirectionsUrlPipe,
    RedactPipe,
    IterablePipe,
    EncodeUriElementPipe,
    DiscountPipe,
    PricePipe,
    AmPmPipe,
    AOrAnPipe,

    // Dialogs
    ErrorDialogComponent,
    InactivityDialogComponent,
    ShowBadgeDialogComponent,
    AppointmentSampleUncollectedDialogComponent,
    AppointmentSampleUnprocessedDialogComponent,
    DoubleBookingConfirmationDialogComponent,
    PriorityTimeslotDialogComponent,
    MarketSelectorDialogComponent,
    AddressWarningDialogComponent,
  ],
  entryComponents: [
    // Components
    LightboxComponent,

    // Dialogs
    ErrorDialogComponent,
    InactivityDialogComponent,
    ShowBadgeDialogComponent,
    AppointmentSampleUncollectedDialogComponent,
    AppointmentSampleUnprocessedDialogComponent,
    DoubleBookingConfirmationDialogComponent,
    PriorityTimeslotDialogComponent,
    MarketSelectorDialogComponent,
    AddressWarningDialogComponent,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MarketInterceptorService,
      multi: true,
    },
    {
      provide: MAT_RIPPLE_GLOBAL_OPTIONS,
      useValue: {
        disabled: true,
      },
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 2500,
        horizontalPosition: 'center',
        verticalPosition: 'top',
      } as MatSnackBarConfig,
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        panelClass: 'app-mat-dialog',
        /* Material sets the max width property as an inline style attribute (set to 80vw by default) - setting a blank string allows us to style this via CSS instead. */
        maxWidth: '',
        hasBackdrop: true,
      } as MatDialogConfig,
    },
  ],
  exports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,

    // Pages
    SignInPageComponent,
    MobileNumberPageComponent,
    DeactivatedPageComponent,
    DeniedPageComponent,
    HipaaCompliancePageComponent,
    BbpCompliancePageComponent,
    BlankPageComponent,
    NotFoundPageComponent,

    // Components
    HeaderComponent,
    StepperHeaderComponent,
    SignInComponent,
    AppointmentsTableComponent,
    CyclicalNavigatorComponent,
    FileInputComponent,
    AvailabilityDayInputComponent,
    ComplianceStatusComponent,
    AccountStatusComponent,
    ActiveStatusComponent,
    SectionHeaderComponent,
    FormGroupComponent,
    PanelComponent,
    MobileNumberFormComponent,
    AuthCodeFormComponent,
    StepperComponent,
    DobInputComponent,
    USStateInputComponent,
    RadioInputComponent,
    InsuranceCardComponent,
    SchedulerComponent,
    SchedulerSlotsComponent,
    AppointmentStatusTextComponent,
    InstructionBarComponent,
    CollectionRequirementsComponent,
    CollectionSampleComponent,
    DocumentCardComponent,
    HipaaExamComponent,
    BbpExamComponent,
    LightboxComponent,
    TabsComponent,
    TabComponent,
    FloatingNavComponent,
    PdfViewerComponent,
    DatepickerComponent,
    QuizComponent,
    DateInputComponent,
    DateRangeInputComponent,
    AppointmentStepComponent,
    AppointmentProgressStepsComponent,
    AppointmentSamplesTableComponent,
    AppointmentSamplesPropertyCheckboxComponent,
    SignaturePadComponent,
    DeliveryVerificationFormComponent,
    DragDropFileUploadComponent,
    MultipleFileInputComponent,
    DocumentsStatusComponent,
    SimpleDobInputComponent,
    LabCompanySelectComponent,
    AppointmentMapComponent,
    FileDownloadAnchorComponent,
    TimeSelectorComponent,
    DateTimeSelectorComponent,
    PriceInputComponent,

    // Directives
    FloatingNavItemDirective,
    RadioGroupDirective,
    DragDropUploadDirective,
    StepIndexerDirective,
    UppercaseInputDirective,

    // Pipes
    FileSizePipe,
    DateTzPipe,
    DateDistancePipe,
    DatesPipe,
    PhonePipe,
    GenderPipe,
    DobPipe,
    DirectionsUrlPipe,
    RedactPipe,
    IterablePipe,
    EncodeUriElementPipe,
    DiscountPipe,
    PricePipe,
    AmPmPipe,

    // Dialogs
    ErrorDialogComponent,
    InactivityDialogComponent,
    AppointmentSampleUncollectedDialogComponent,
    AppointmentSampleUnprocessedDialogComponent,
    DoubleBookingConfirmationDialogComponent,

    UiModule,

    ...thirdPartyModules,
    AppointmentSchedulerComponent,
    LabOrderRepeaterComponent,
    MarketSelectorButtonComponent,
    IfAddressIsLabDirective,
  ],
})
export class SharedModule {}

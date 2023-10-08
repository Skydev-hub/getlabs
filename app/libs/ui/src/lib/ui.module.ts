import { CdkAccordionModule } from '@angular/cdk/accordion';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { APP_INITIALIZER, ErrorHandler, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { GoogleMapsModule } from '@angular/google-maps';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DEFAULT_OPTIONS, MatDialogConfig, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { IconSpriteModule } from 'ng-svg-icon-sprite';
import { CookieModule } from 'ngx-cookie';
import { NgxMaskModule } from 'ngx-mask';
import { ToastrModule } from 'ngx-toastr';
import { ButtonComponent, CheckboxInputComponent } from './components';
import { AccordianComponent } from './components/accordian/accordian.component';
import { AddressAutocompleteComponent } from './components/address-autocomplete/address-autocomplete.component';
import { AddressLookupComponent } from './components/address-lookup/address-lookup.component';
import { AuthCodeInputComponent } from './components/auth-code-input/auth-code-input.component';
import { AuthStateBtnComponent } from './components/auth-state-btn/auth-state-btn.component';
import { AvatarComponent } from './components/avatar/avatar.component';
import { AwardCampaignAmountComponent } from './components/award-campaign-amount/award-campaign-amount.component';
import { AwardCampaignButtonComponent } from './components/award-campaign-button/award-campaign-button.component';
import { LabcorpAcknowledgementDialogComponent } from './components/dialog/labcorp-acknowledgement-dialog/labcorp-acknowledgement-dialog.component';
import { ExpansionPanelComponent } from './components/expansion-panel/expansion-panel.component';
import { AppliedFiltersComponent } from './components/filters/applied-filters/applied-filters.component';
import { ListFilterComponent } from './components/filters/list-filter/list-filter.component';
import { FooterComponent } from './components/footer/footer.component';
import { FormElementComponent } from './components/form-element/form-element.component';
import { BasicUserSelectorInputComponent } from './components/form/input/basic-user-selector-input/basic-user-selector-input.component';
import { GoogleMapsLazyLoaderDirective } from './directives/google-maps-lazy-loader.directive';
import { GoogleMapsOptionsExtDirective } from './directives/google-maps-options-ext.directive';
import { LazyLoaderDirective } from './directives/lazy-loader.directive';
import { LabPartnerInlineNameComponent } from './components/lab-partner-inline/lab-partner-inline-name.component';
import { OptInComponent } from './components/opt-in/opt-in.component';
import { PartnerInlineContentBlock } from './components/partner-inline-content/partner-content/partner-inline-content-block.directive';
import { PartnerInlineContentComponent } from './components/partner-inline-content/partner-inline-content.component';
import { PartnerSiteMessageComponent } from './components/partner-site-message/partner-site-message.component';
import { PhoneInputComponent } from './components/phone-input/phone-input.component';
import { PriceComponent } from './components/price/price.component';
import { ProgressiveDisclosureAcknowledgeComponent } from './components/progressive-disclosure/progressive-disclosure-acknowledge.component';
import { ProgressiveDisclosureDisacknowledgeComponent } from './components/progressive-disclosure/progressive-disclosure-disacknowledge.component';
import { FacebookShareComponent } from './components/share/facebook-share/facebook-share.component';
import { ShareComponent } from './components/share/share.component';
import { TwitterShareComponent } from './components/share/twitter-share/twitter-share.component';
import { SignInConfirmComponent } from './components/sign-in-confirm/sign-in-confirm.component';
import { SiteMessageComponent } from './components/site-message/site-message.component';
import { SocialLinksComponent } from './components/social-links/social-links.component';
import {
  DefaultContentDirective,
  FormContainerDirective,
  NgTemplateNameDirective,
  NoContentDirective,
  ServerRenderDirective,
  TargetBlankDirective
} from './directives';
import { DocumentMouseLeaveListenerDirective } from './directives/document-mouse-leave-listener.directive';
import { FormControlNativeElementDirective } from './directives/form-control-native-element.directive';
import { HrefDirective } from './directives/href.directive';
import { InlineTemplateManagerDirective } from './directives/inline-template-manager.directive';
import { LabcorpAcknowledgementDirective } from './directives/labcorp-acknowledgement.directive';
import { ListFilterContainerDirective } from './directives/list-filter-container.directive';
import { LoadingDirective } from './directives/loading.directive';
import { MailtoDirective } from './directives/mailto.directive';
import { ModalAnchorDirective } from './directives/modal-anchor.directive';
import { PartnerContentDirective } from './directives/partner-content.directive';
import { ProgressiveDisclosureElementDirective } from './directives/progressive-disclosure-element.directive';
import { ProgressiveDisclosureDirective } from './directives/progressive-disclosure.directive';
import { RapidMouseDetectorDirective } from './directives/rapid-mouse-detector.directive';
import { StickyBlockDirective } from './directives/sticky-block.directive';
import { TemplateIdDirective } from './directives/template-id.directive';
import { TemplateVariableDirective } from './directives/template-variable.directive';
import { GoogleMapsLoader } from './loaders/google-maps.loader';
import { LabcorpPartnerOperator } from './partners';
import { LabxpressPartnerOperatorService } from './partners/labxpress-partner-operator.service';
import { RupaPartnerOperator } from './partners/rupa-partner-operator.service';
import { AddressPipe, InitialsPipe, InterAppUrlPipe, IsoWeekDayPipe, MapPinLabelPipe, MapAndJoinPipe, ParseDatePipe } from './pipes';
import { LabPipe } from './pipes/lab.pipe';
import { TruncateNumbersPipe } from './pipes/truncate-numbers.pipe';
import { ExternalRedirect } from './redirects/external.redirect';
import { InterAppRedirect } from './redirects/inter-app.redirect';
import { InternalRedirect } from './redirects/internal.redirect';
import { LabcorpReferrerOperator } from './referrers';
import { LabXpressReferrerOperator } from './referrers/lab-xpress-referrer.operator';
import { PartnerRouteMatcher, PeerReferralRouteMatcher } from './routing';
import { ErrorService } from './services/error.service';
import { AbTestDirective } from './directives/ab-test.directive';
import { HTTP_INTERCEPTORS, HttpClientJsonpModule } from '@angular/common/http';
import { HttpAnalyticsInterceptorService } from './interceptors/http-analytics-interceptor.service';
import { AutoFocusDirective } from './directives/auto-focus.directive';
import { MaskRegexpMappings } from './utils';

const components = [
  AccordianComponent,
  AuthStateBtnComponent,
  AvatarComponent,
  AddressLookupComponent,
  ExpansionPanelComponent,
  FooterComponent,
  FormElementComponent,
  SiteMessageComponent,
  SocialLinksComponent,
  AddressAutocompleteComponent,
  LabcorpAcknowledgementDialogComponent,
  ProgressiveDisclosureAcknowledgeComponent,
  ProgressiveDisclosureDisacknowledgeComponent,
  PartnerInlineContentComponent,
  LabPartnerInlineNameComponent,
  OptInComponent,
  PhoneInputComponent,
  SignInConfirmComponent,
  AuthCodeInputComponent,
  BasicUserSelectorInputComponent,
  PriceComponent,
  ListFilterComponent,
  CheckboxInputComponent,
  AppliedFiltersComponent,
  ButtonComponent,
  PartnerSiteMessageComponent,
  AwardCampaignButtonComponent,
  AwardCampaignAmountComponent
];

const directives = [
  NoContentDirective,
  ServerRenderDirective,
  TargetBlankDirective,
  FormContainerDirective,
  DefaultContentDirective,
  HrefDirective,
  LabcorpAcknowledgementDirective,
  ProgressiveDisclosureElementDirective,
  ProgressiveDisclosureDirective,
  PartnerContentDirective,
  StickyBlockDirective,
  ModalAnchorDirective,
  LoadingDirective,
  FormControlNativeElementDirective,
  NgTemplateNameDirective,
  InlineTemplateManagerDirective,
  RapidMouseDetectorDirective,
  DocumentMouseLeaveListenerDirective,
  ListFilterContainerDirective,
  TemplateVariableDirective,
  PartnerInlineContentBlock,
  MailtoDirective,
  ShareComponent,
  FacebookShareComponent,
  TwitterShareComponent,
  AbTestDirective,
  TemplateIdDirective,
  LazyLoaderDirective,
  GoogleMapsLazyLoaderDirective,
  GoogleMapsOptionsExtDirective,
  AutoFocusDirective
];

const pipes = [AddressPipe, InitialsPipe, InterAppUrlPipe, IsoWeekDayPipe, LabPipe, MapAndJoinPipe, MapPinLabelPipe, ParseDatePipe, TruncateNumbersPipe];

const uninjectables = [PeerReferralRouteMatcher, PartnerRouteMatcher];

@NgModule({
  imports: [
    CommonModule,
    HttpClientJsonpModule,
    RouterModule.forChild([]),
    ReactiveFormsModule,

    ToastrModule.forRoot({
      positionClass: 'toast-top-full-width'
    }),

    // Both icon modules are currently in use, but we should transition to individual icons rather than sprites
    IconSpriteModule.forRoot({ path: 'assets/icons.svg' }),
    NgxMaskModule.forRoot({
      /* Need to include custom mappings for specific use cases. */
      patterns: MaskRegexpMappings,

      /* Previous behaviour of angular2-text-mask was to include mask characters (i.e. formatting characters
       * inserted automatically by the mask directive) in the input model.  This option preserves this
       * behaviour. */
      dropSpecialCharacters: false,

      /* Continuing our use of ConformsToMaskValidator requires that the default validation functionality
       * be disabled. */
      validation: false,
    }),

    CookieModule.forChild(),

    CdkAccordionModule,
    OverlayModule,
    MatAutocompleteModule,
    MatDialogModule,
    MatChipsModule,
    MatIconModule
  ],
  declarations: [...components, ...directives, ...pipes],
  entryComponents: [LabcorpAcknowledgementDialogComponent],
  exports: [
    ReactiveFormsModule,
    IconSpriteModule,
    MatAutocompleteModule,
    GoogleMapsModule,
    NgxMaskModule,
    ...components,
    ...directives,
    ...pipes
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpAnalyticsInterceptorService,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: ErrorService
    },
    /* Partner / Referrer operators */
    LabcorpReferrerOperator,
    LabcorpPartnerOperator,
    RupaPartnerOperator,
    LabxpressPartnerOperatorService,
    LabXpressReferrerOperator,

    /* Redirect strategies */
    InternalRedirect,
    ExternalRedirect,
    InterAppRedirect,

    /* Loaders */
    GoogleMapsLoader,

    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: function() {
        /* Required so that our non-injected decorated classes are detected in prod mode */
        return () => uninjectables;
      }
    },
    {
      provide: MAT_DIALOG_DEFAULT_OPTIONS,
      useValue: {
        panelClass: 'app-mat-dialog',
        /* Material sets the max width property as an inline style attribute (set to 80vw by default) - setting a blank string allows us to style this via CSS instead. */
        maxWidth: '',
        hasBackdrop: true
      } as MatDialogConfig
    }
  ]
})
export class UiModule {}

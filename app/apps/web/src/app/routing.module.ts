import { NgModule } from '@angular/core';
import { RouterModule, RunGuardsAndResolvers, UrlSegment } from '@angular/router';
import { DynamicMetaData, getLabName, LabCompany, LabPipe, MetadataInject, ReferrerService, ReferrerType, routeMatcher } from '@app/ui';
import { AuthenticatedUserResolver, RouteRedirectResolver } from '@app/ui';
import { LAB_PIPE } from './injection.constants';
import { AboutPageComponent } from './pages/about/about-page.component';
import { CitiesPageComponent } from './pages/cities/cities-page.component';
import { ContactPageComponent } from './pages/contact/contact-page.component';
import { FaqPageComponent } from './pages/faq/faq-page.component';
import { HomePageComponent } from './pages/home/home-page.component';
import { LabsPageComponent } from './pages/labs/labs-page.component';
import { LocationDetailsPageComponent } from './pages/labs/location-details/location-details-page.component';
import { PaymentsPageComponent } from './pages/legal/payments/payments-page.component';
import { PrivacyPageComponent } from './pages/legal/privacy/privacy-page.component';
import { TermsPageComponent } from './pages/legal/terms/terms-page.component';
import { NotFoundPageComponent } from './pages/not-found/not-found-page.component';
import { ProvidersPageComponent } from './pages/providers/providers-page.component';
import { LabLocationBySlugResolver } from './resolvers/lab-location-by-slug.resolver';
import { LabLocationCompanyResolver } from './resolvers/lab-location-company.resolver';
import { RedirectResolver } from './resolvers/redirect.resolver';

/* Boilerplate definition for a dynamically-resolved meta property that can be applied specifically to referred vs. non-referred cases. */
const referrerMetaResolver = (getValue: (referrer: string | null, labCompany: LabCompany) => string): DynamicMetaData => {
  class WebsiteMetaResolver implements DynamicMetaData {
    /**
     * Simply resolves the lab company name from the currently-defined referrer (if available), and
     * calls the getValue function supplied to the enveloping factory function with this value.  If
     * there is currently no active referrer, this method will invoke getData with null.
     */
    getData(referrerService: ReferrerService, @MetadataInject(LAB_PIPE) labPipe: LabPipe) {
      /* Retrieve the current referral snapshot.  If this referral is active, we will invoke the supplied function with the user-friendly
       * string corresponding to the active referral.  Otherwise, we will invoke the supplied function with null. */
      const refSnapshot = referrerService.getReferrerSnapshot();

      return referrerService.isReferralActive(refSnapshot, { type: ReferrerType.Partner })
        ? getValue(labPipe.transform(refSnapshot.data.referrer), refSnapshot.data.referrer)
        : getValue(null, null);
    }
  }

  return new WebsiteMetaResolver();
};

/* Required as the AOT compiler will bail if decorators contain dynamic logic. */
export function rootRouteMatcherWrapper(segments: UrlSegment[]) {
  return routeMatcher(segments, 'root');
}

const routes = [
  {
    path: '',
    resolve: {
      user: AuthenticatedUserResolver,
      appRedirect: RedirectResolver,
    },
    runGuardsAndResolvers: 'always' as RunGuardsAndResolvers,
    data: {
      meta: {
        description: referrerMetaResolver((referrer: string, lab: LabCompany) => {
          return `Stay safe and skip the waiting room. We send a mobile phlebotomist to your home or office to draw your lab order and deliver to ${
            lab ? getLabName(lab) : 'Labcorp and Quest Diagnostics'
          }.`;
        }),
        'twitter:card': 'summary',
        'twitter:site': '@getlabs',
        'twitter:creator': '@getlabs',
        'twitter:image': 'https://getlabs.com/assets/img/gl-twitter-img.png',
        'og:image': 'https://getlabs.com/assets/img/gl-og-img.png',
        robots: 'index,follow',
        keywords: 'labcorp,quest,laboratory,near,blood,draw,order,test,phlebotomist,home',
      },
    },
    children: [
      {
        matcher: rootRouteMatcherWrapper,
        component: HomePageComponent,
        data: {
          meta: {
            title: referrerMetaResolver((referrer: string, lab: LabCompany) => {
              return `At-Home Lab Appointments for ${lab ? getLabName(lab) : 'Labcorp & Quest'}`;
            }),
            'og:title': 'Stay safe and skip the waiting room.',
            'og:description': 'Getlabs provides convenient at-home lab appointments.',
          },
        },
      },
      {
        path: 'about',
        component: AboutPageComponent,
        data: {
          meta: {
            title: 'About Us',
            description:
              "Getlabs' mission is to reduce patient non-compliance by creating the infrastructure for quality at-home healthcare. Learn more about us.",
          },
        },
      },
      {
        path: 'cities',
        component: CitiesPageComponent,
        data: {
          meta: {
            title: 'Cities We Serve',
            description: 'Getlabs offers convenient at-home lab appointments across the United States and North America.',
          },
        },
      },
      {
        path: 'labs',
        children: [
          {
            path: '',
            component: LabsPageComponent,
          },
          {
            path: 'lab-corp',
            redirectTo: 'labcorp',
          },
          {
            path: ':lab',
            resolve: {
              lab: LabLocationCompanyResolver,
            },
            children: [
              {
                path: '',
                component: LabsPageComponent,
              },
              {
                path: ':slug',
                resolve: {
                  location: LabLocationBySlugResolver,
                },
                component: LocationDetailsPageComponent,
              },
            ],
          },
        ],
      },
      {
        path: 'faq',
        data: {
          meta: {
            title: 'FAQ',
            description: 'Getlabs provides convenient at-home lab appointments. View our Frequently Asked Questions or contact us directly.',
          },
        },
        children: [
          {
            path: '',
            component: FaqPageComponent,
          },
          {
            path: ':slug',
            component: FaqPageComponent,
          },
        ],
      },
      {
        path: 'contact',
        component: ContactPageComponent,
        data: {
          meta: {
            title: 'Contact Us',
            description: "Getlabs provides convenient at-home lab appointments. Contact us to book a visit or ask questions. We're here to help.",
          },
        },
      },
      {
        path: 'providers',
        component: ProvidersPageComponent,
        data: {
          meta: {
            title: 'Providers',
            description:
              '25% of patients are non-compliant with lab tests. With Getlabs, providers can measurably improve patient outcomes by offering at-home lab appointments.',
          },
        },
      },
      {
        path: 'privacy',
        component: PrivacyPageComponent,
        data: {
          meta: {
            title: 'Privacy Policy',
            description: 'Getlabs convenient at-home lab appointments. Learn about our Privacy Policy.',
          },
        },
      },
      {
        path: 'terms',
        component: TermsPageComponent,
        data: {
          meta: {
            title: 'Terms of Service',
            description: 'Getlabs provides convenient at-home lab appointments. Learn about our Terms of Service.',
          },
        },
      },
      {
        path: 'payments',
        component: PaymentsPageComponent,
        data: {
          meta: {
            title: 'Payments Policy',
            description: 'Getlabs provides convenient at-home lab appointments. Learn about our Payments Policy.',
          },
        },
      },
      {
        path: 'refer',
        resolve: {
          redirect: RouteRedirectResolver,
        },
        data: {
          redirect: {
            target: '/refer',
            subdomain: 'app',
          },
        },
        /* Required so that a component-less route will compile */
        children: [],
      },
    ],
  },
  {
    path: '**',
    component: NotFoundPageComponent,
    data: {
      meta: {
        title: 'Page Not Found',
        description: 'This page was not found. Please return to our homepage at getlabs.com',
      },
    },
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always',
      anchorScrolling: 'enabled',
      initialNavigation: 'enabled',
      // enableTracing: true,
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class RoutingModule {}

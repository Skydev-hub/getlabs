import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthByKeyGuard } from './modules/shared/guards/auth-by-key.guard';
import { BlankPageComponent } from './modules/shared/pages/blank/blank-page.component';

const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: ':key',
        canActivate: [AuthByKeyGuard],
        component: BlankPageComponent,
      },
    ],
  },
  {
    path: 'care',
    loadChildren: () => import('./modules/specialist/specialist.module').then((m) => m.SpecialistModule),
  },
  {
    path: 'team',
    loadChildren: () => import('./modules/team/team.module').then((m) => m.TeamModule),
  },
  // Note: This module contains a catch-all 404 route and must go last
  {
    path: '',
    loadChildren: () => import('./modules/patient/patient.module').then((m) => m.PatientModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always',
      relativeLinkResolution: 'legacy',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

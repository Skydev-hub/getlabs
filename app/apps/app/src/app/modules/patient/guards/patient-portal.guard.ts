import { Injectable } from '@angular/core';
import { PatientUser } from '@app/ui';
import { AuthGuard } from '../../shared/guards/auth.guard';

@Injectable({
  providedIn: 'root'
})
export class PatientPortalGuard extends AuthGuard {
  getUserType() {
    return PatientUser;
  }

  getRedirectUrl() {
    return '/sign-in';
  }
}

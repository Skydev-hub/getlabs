import { Injectable } from '@angular/core';
import { SpecialistUser } from '@app/ui';
import { AuthGuard } from '../../shared/guards/auth.guard';

@Injectable({
  providedIn: 'root'
})
export class SpecialistPortalGuard extends AuthGuard {
  getUserType() {
    return SpecialistUser;
  }

  getRedirectUrl() {
    return '/care/sign-in';
  }
}

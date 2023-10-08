import { Injectable } from '@angular/core';
import { StaffUser } from '@app/ui';
import { AuthGuard } from '../../shared/guards/auth.guard';

@Injectable({
  providedIn: 'root'
})
export class TeamPortalGuard extends AuthGuard {
  getUserType() {
    return StaffUser;
  }

  getRedirectUrl() {
    return '/team/sign-in';
  }
}

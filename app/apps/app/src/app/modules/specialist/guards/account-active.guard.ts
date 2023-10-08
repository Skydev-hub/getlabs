import { Injectable } from '@angular/core';
import { AccountActiveGuard as BaseAccountActiveGuard } from '../../shared/guards/account-active.guard';

@Injectable({
  providedIn: 'root'
})
export class AccountActiveGuard extends BaseAccountActiveGuard {
  getRedirectUrl() {
    return '/care/_private/deactivated';
  }
}

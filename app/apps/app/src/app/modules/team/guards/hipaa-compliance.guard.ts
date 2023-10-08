import { Injectable } from '@angular/core';
import { ComplianceGuard as BaseComplianceGuard } from '../../shared/guards/compliance.guard';

@Injectable({
  providedIn: 'root'
})
export class HipaaComplianceGuard extends BaseComplianceGuard {
  getRedirectUrl() {
    return '/team/compliance/hipaa';
  }
}

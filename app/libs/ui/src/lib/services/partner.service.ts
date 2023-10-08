import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AbstractPartnerOperator, PartnerMetadataHelper, PartnerOperator } from '../decorators';
import { LabCompany } from '../models';

/**
 * Interface that all services managing Partner definitions should implement.
 */
export interface IPartnerService {
  acknowledge: (partner: any, operatorType: string, data?: { [key: string]: any }) => Observable<boolean>;
}

/**
 * Generic service for managing Partner definitions. Consumers may invoke this service's methods to delegate generic tasks
 * to partner-specific operators.
 */
@Injectable({
  providedIn: 'root'
})
export class PartnerService implements IPartnerService {
  constructor(private readonly injector: Injector) {}

  private readonly _partnerDescriptors: { [key: string]: AbstractPartnerOperator } = {};

  /**
   * Runs the acknowledgement operation that is appropriate for hte supplied labCompany.
   */
  public acknowledge(labCompany: LabCompany, operatorType?: string, data?: { [key: string]: any }) {
    /* Attempt to retrieve a service for the supplied lab company */
    const service = this._getPartnerOperator(labCompany, operatorType);

    /* If successful, return the result of the service's acknowledge method; otherwise, always return true. */
    return service ? service.acknowledge(data) : of(true);
  }

  /**
   * Retrieves the an injected instance of the operator class that is defined for the supplied lab company.
   */
  public getPartnerDescriptor(partner: string): AbstractPartnerOperator {
    // Not found - resolve the descriptor the long way
    if (!this._partnerDescriptors[partner]) {
      /* Retrieve the partner descriptor type from the Partner metadata */
      const descriptorType = PartnerMetadataHelper.getPartnerDescriptorType(partner);
      this._partnerDescriptors[partner] = descriptorType && this.injector.get(descriptorType);
    }

    /* Retrieve the partner descriptor type from the Partner metadata */
    return this._partnerDescriptors[partner];
  }

  private _getPartnerOperator(partner: string, operatorType?: string): PartnerOperator {
    /* Attempt to retrieve a service for the supplied lab company */
    const descriptor = this.getPartnerDescriptor(partner);
    return (descriptor && descriptor.getOperator(operatorType)) || descriptor;
  }
}

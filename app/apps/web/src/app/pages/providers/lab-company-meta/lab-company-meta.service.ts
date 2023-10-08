import { Inject, Injectable } from '@angular/core';
import { LabCompany, LabLocationDetails, LabPipe, MetaService } from '@app/ui';
import { LAB_PIPE } from '../../../injection.constants';

/**
 * Provides a lab company / PSC specific abstraction to the generic MetaService.
 */
@Injectable({ providedIn: 'root' })
export class LabCompanyMetaService {
  constructor(private readonly meta: MetaService, @Inject(LAB_PIPE) private readonly labPipe: LabPipe) {}

  /**
   * Sets the meta description of the current view according to the supplied lab company and location (or lack thereof)
   */
  setMetaDescription(labCompany?: LabCompany, location?: LabLocationDetails) {
    this.meta.setTag(
      'description',
      `Find hours, address, and contact information for ${this.getPscStr(labCompany, location)} or schedule an at-home lab appointment with Getlabs.`
    );
  }

  /**
   * Sets the meta title of the current view according to the supplied lab company and location (or lack thereof)
   */
  setMetaTitle(labCompany?: LabCompany, location?: LabLocationDetails) {
    let title;

    if (location) {
      /* If the location is defined, we'll need to specifically list the address in the title. */
      const address = [
        location.address.street ? `at ${location.address.street}` : null,
        'in',
        [location.address.city, location.address.state].filter(Boolean).join(', ')
      ]
        .filter(Boolean)
        .join(' ');

      title = `${this.labPipe.transform(labCompany)} ${address}`;
    } else {
      /* Otherwise, the title will depend on whether or not the lab company is present. */
      title = labCompany
        ? `Find Nearby & At-Home ${this.labPipe.transform(labCompany)} Appointments`
        : `Find Nearby & At-Home ${this.getLabCompanyStr(null, '&')} Locations`;
    }

    this.meta.setTitle(title);
  }

  /**
   * Sets the meta details of the current view according to the supplied lab company and location (or lack thereof)
   */
  setMeta(labCompany?: LabCompany, location?: LabLocationDetails) {
    this.setMetaTitle(labCompany, location);
    this.setMetaDescription(labCompany, location);
  }

  /**
   * Simple abstraction for displaying a string if a given condition is true.
   */
  private getConditionalStr(condition: boolean, str: string) {
    return (condition && str) || '';
  }

  /**
   * Retrieves the patient service center string corresponding to the supplied lab company and location.  If location is not supplied, this method will return
   * a general string for the supplied lab company.  If lab company is also not supplied, this method will return a general string reflecting all lab
   * companies (with the notable exception of LabXpress).
   */
  private getPscStr(labCompany: LabCompany, location?: LabLocationDetails) {
    return (
      (labCompany
        ? /* If the lab company is specified, the lab company string will indicate 'this company x patient service center' */
          `${this.getConditionalStr(!!location, 'this ')}${this.labPipe.transform(labCompany)}`
        : /* Otherwise, the lab company string needs to include the full set of lab companies, except for LabXpress. */
          this.getLabCompanyStr(labCompany)) +
      /* Last item to consider is the plurality of center(s) - if the location is not specified, center is plural. */
      ` patient service center${this.getConditionalStr(!location, 's near you')}`
    );
  }

  /**
   * Retrieves a string containing the human-readable output of the supplied lab company, or of all main lab companies.
   */
  private getLabCompanyStr(labCompany?: LabCompany, terminusSeparator: 'or' | '&' = 'or') {
    return labCompany
      ? this.labPipe.transform(labCompany)
      : Object.values(LabCompany)
          .filter(lc => [LabCompany.LabCorp, LabCompany.QuestDiagnostics].includes(lc))
          .reduce((str, lc, idx, arr) => {
            return ((str && str + (idx < arr.length - 1 ? ', ' : ` ${terminusSeparator} `)) || '') + this.labPipe.transform(lc);
          }, '');
  }
}

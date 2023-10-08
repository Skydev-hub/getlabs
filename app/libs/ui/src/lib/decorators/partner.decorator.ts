import { Injectable, Injector, Type } from '@angular/core';
import { addMilliseconds, isAfter, isBefore } from 'date-fns';
import { filter } from 'rxjs/operators';
import { Observable, ReplaySubject } from 'rxjs';
import { AutoUnsubscribe } from '../utils/http.utils';
import { Reflect } from 'core-js';

export type LabCompanyOperator<T> = (data?: { [key: string]: any }) => Observable<T>;

/**
 * Basic object shape for all PartnerOperator implementations (i.e. whoever uses @Partner, as well as all suboperators)
 */
export interface PartnerOperator {
  /**
   * Acknowledges the terms and conditions that apply to this particular partner
   */
  acknowledge: LabCompanyOperator<boolean>;

  /**
   * Determines if the current partner referral starting on the supplied date would be active on the queried date.
   */
  isActive(referralActivatedDate: Date, queriedDate?: Date): boolean;
}

/**
 * Metadata key that indexes the partners registered with Getlabs (via the partner descriptor - i.e. Type<AbstractPartnerOperator>)
 */
const RegisteredPartnersMetadataKey = `lab-company-definition`;

/**
 * Metadata key that indexes the metadata describing each registered partner.  Indexes PartnerMetadata objects.
 */
const PartnerDescriptionMetadataKey = 'partner-description';

/**
 * Metadata key that indexes the suboperators applied to a given partner.  Indexes PartnerOperator objects.
 */
const PartnerSuboperatorMetadataKey = 'partner-suboperators';

/**
 * Defines the top-level behaviours of a given Getlabs partner; any classes that use the @Partner annotation must extend
 * this class.
 */
@Injectable()
export abstract class AbstractPartnerOperator implements PartnerOperator {
  constructor(private readonly injector: Injector) {}

  /**
   * Executes specific logic for acknowledging the terms and conditions of a given partner referral.  To be implemented by
   * individual partner implementations.
   */
  abstract acknowledge(data?: { [key: string]: any }): Observable<boolean>;

  /**
   * Determines if a referral tied to this partner is active according to the time-to-live value defined for that partner (via
   * the partner decorator).
   */
  public isActive(referralActivatedDate: Date, queriedDate = new Date()) {
    const options = this.getMetadata();
    return !!options && !!options.referralTtl && isAfter(queriedDate, referralActivatedDate) && isBefore(queriedDate,
      addMilliseconds(referralActivatedDate, options.referralTtl))
  }

  /**
   * Retrieves the metadata defined for this partner implementation.  Metadata contains various pieces of information that describe
   * the nature of a given partner integration (i.e. display options, referral lifecycle, etc.)
   */
  public getMetadata(): PartnerMetadata {
    /* Return the partner descriptor defined as a metadata object on this class */
    return PartnerMetadataHelper.getPartnerMetadata(Object.getPrototypeOf(this).constructor);
  }

  /**
   * Determines if the supplied string is an alias for the partner described by this object.
   */
  public isAlias(alias: string) {
    const options = this.getMetadata();

    return !!alias && !!options && !!options.aliases &&
      options.aliases.some(knownAlias => knownAlias.toUpperCase() === alias.toUpperCase());
  }

  /**
   * Retrieves the operator class corresponding to the supplied operator type
   */
  public getOperator<T extends PartnerOperator = PartnerOperator>(operatorType: string): T {
    /* Retrieve the suboperators defined on this class */
    const suboperators = Reflect.getMetadata(PartnerSuboperatorMetadataKey, Object.getPrototypeOf(this));
    return suboperators && suboperators[operatorType] && this.injector.get<T>(suboperators[operatorType]);
  }
}

/**
 * A set of options that describe the nature of a given partner integration.
 */
export interface PartnerOptions {
  aliases?: string[];
  banner?: {
    logo?: string;
    displayName?: string;
  },
  referralTtl?: number,
}

/**
 * An internal extension of PartnerOptions that tracks the natural key of a given partner (i.e. the primary 'key' we use to
 * track a given partner's identity).
 */
interface PartnerMetadata extends PartnerOptions {
  key: string;
}

/**
 * Decorator for defining partner-specific behaviour.  The operatorType parameter indicates what type of operator the annotated
 * class represents, and is not mandatory.  If this value is not supplied, it will default to DefaultOperator.  Only one
 * operator of each supplied type can be registered.
 */
export function Partner(partner: string, options?: PartnerOptions) {
  return (partnerDefinition: Type<AbstractPartnerOperator>) => {
    /* Define the supplied partner details and annotated class as a partner definition */
    PartnerMetadataHelper.addPartner(partner, partnerDefinition, options);
  }
}

/**
 * Interface that assists with the management of Partner definitions.
 */
export class PartnerMetadataHelper {
  private static partnerRegistrationSubject$ = new ReplaySubject<{ partner: string, descriptor: Type<AbstractPartnerOperator> }>();

  /**
   * Retrieves the AbstractPartnerOperator type defined for the supplied partner.  If the supplied partner matches a given partner
   * metadata's primary key, or any of its aliases, this method will return the corresponding partner descriptor.
   *
   * If the strict parameter is set to false, this method will attempt to resolve the partner by executing an open-ended regex
   * evaluation against the supplied string.  In other words, this means that if a given partner's primary key or any of its
   * aliases are found in any position in the supplied string, this method will consider this evaluation as a match, and will
   * return the corresponding partner descriptor.
   */
  public static getPartnerDescriptorType(
    partner: string,
    strict = true,
  ): Type<AbstractPartnerOperator> {
    const partnerDescriptors: { [key: string]: Type<AbstractPartnerOperator> } = Reflect.getMetadata(RegisteredPartnersMetadataKey, Partner);

    /* See if we can find a key/alias that matches the formulated regex */
    return Object.values(partnerDescriptors).find(partnerDescriptor => {
      /* Retrieve the metadata defined for this type */
      const metadata = PartnerMetadataHelper._getPartnerMetadata(partnerDescriptor);

      /* Evaluate the partner's key and aliases against the formulated regex */
      return [metadata.key].concat(metadata.aliases || []).some(moniker => {
        /* We will use a regex-based approach to identify matches.  If strict mode is set, we only want exact matches for the partner name
         * and its aliases.  If strict mode is not set, we will try to find matches in where the partner name is found within the
         * supplied string. */
        let regexStr = `${ moniker }`;
        if (strict) {
          regexStr = `^${ regexStr }$`;
        }

        /* Evaluate the supplied string against the constructed regex */
        return (new RegExp(regexStr, 'i')).test(partner);
      });
    });
  }


  /**
   * Retrieves the PartnerDescriptor metadata defined for the supplied partner.
   */
  public static getPartnerMetadata<T extends PartnerOperator>(partner: Type<AbstractPartnerOperator>);
  public static getPartnerMetadata<T extends PartnerOperator>(partner: string, strict?: boolean);
  public static getPartnerMetadata<T extends PartnerOperator>(partner: string | Type<AbstractPartnerOperator>, strict = true): PartnerMetadata {
    /* If the supplied partner value is a string, we must resolve the descriptor first through #getPartnerDescriptorType.  Otherwise,
     * we can handle the partner descriptor directly. */
    const descriptorType = typeof partner === 'string' ?
      PartnerMetadataHelper.getPartnerDescriptorType(partner, strict) : partner;

    /* Retrieve the metadata set on that type. */
    return descriptorType && PartnerMetadataHelper._getPartnerMetadata(descriptorType);
  }

  /**
   * Adds an operator to the defined partner definition.  If the defined partner definition is not yet available, this method
   * will wait until the partner operation becomes available to add the operator.
   */
  public static addOperator(operator: Type<PartnerOperator>, partner: string, operatorType: string) {
    /* Set the partner data asynchronously to accommodate discrepancies in TypeScript module inits */
    this.partnerRegistrationSubject$.asObservable().pipe(
      filter(registeredPartnerDef => registeredPartnerDef.partner.toUpperCase() === partner.toUpperCase()),
    ).subscribe(AutoUnsubscribe(registeredPartnerDef => {
      /* Pull out the existing suboperator metadata, and define the supplied suboperator */
      const suboperators = Reflect.getMetadata(PartnerSuboperatorMetadataKey, registeredPartnerDef.descriptor.prototype) || {};
      suboperators[operatorType] = operator;

      /* Paste back onto the partner descriptor */
      Reflect.defineMetadata(PartnerSuboperatorMetadataKey, suboperators, registeredPartnerDef.descriptor.prototype);
    }));
  }

  /**
   * Defines a new metadata key for the supplied partner definition - the partner's company name is gleaned from the supplied
   * object's 'partner' parameter.
   */
  public static addPartner(partner: string, partnerDefinition: Type<AbstractPartnerOperator>, options?: PartnerOptions) {
    /* Retrieve the existing partner definitions, if applicable... */
    const partnerDefs = Reflect.getMetadata(RegisteredPartnersMetadataKey, Partner) || {};

    /* Define the supplied class as the partner definition for the indicated partner name, and assign the supplied options
     * to the partner definition's prototype. */
    partnerDefs[partner] = partnerDefinition;
    Reflect.defineMetadata(PartnerDescriptionMetadataKey, {
      key: partner,
      ...options,
    }, partnerDefinition.prototype);

    /* Paste the updated partner defs back onto the Partner decorator as metadata */
    Reflect.defineMetadata(RegisteredPartnersMetadataKey, partnerDefs, Partner);

    /* Emit the new partner definition, so that our operators may be registered against it. */
    this.partnerRegistrationSubject$.next({ partner, descriptor: partnerDefinition });
  }

  /**
   * Internal method that retrieves the metadata defined for the supplied partner descriptor.
   */
  private static _getPartnerMetadata(partner: Type<AbstractPartnerOperator>) {
    return Reflect.getMetadata(PartnerDescriptionMetadataKey, partner.prototype);
  }
}

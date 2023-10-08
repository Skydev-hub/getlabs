import { Injectable, Injector, Type } from '@angular/core';

/**
 * General shape of the object that must be passed into the 'redirect' method.
 * Consumers making use of RouteRedirectResolver can specify a paremeter with this object type as the 'redirect'
 * property in the route's data definition.
 */
export interface RedirectData {
  target: string;
  subdomain?: 'app'
}

/**
 * All redirect strategies implement the below interface.
 */
export interface RedirectHandler {
  /**
   * Identifies whether or not the redirect strategy applies according to the supplied params.
   */
  identify(redirectParams: RedirectData): boolean;

  /**
   * Performs the actual redirect according to the supplied params.
   */
  redirect(redirectParams: RedirectData): void;
}

/* Contains all of the redirect handlers registered via the Redirect annotation */
const RedirectHandlerSets: { type: Type<RedirectHandler>, instance: RedirectHandler }[] = [];

/**
 * Denotes a redirect strategy.  Classes using this decorator must be injectables.
 */
export function Redirect() {
  return (type: Type<RedirectHandler>) => {
    RedirectHandlerSets.push({ type, instance: null });
  };
}

@Injectable({
  providedIn: 'root',
})
export class RedirectService {
  constructor(private readonly injector: Injector) { }

  /**
   * Perform a redirect according to the supplied parameters.  This method will search for the redirect strategy appropriate for
   * the supplied parameter set, and will invoke that strategy accordingly.
   */
  redirect(redirectParams: RedirectData) {
      /* If the redirect parameters are not present, or the target is not defined, throw an exception. */
    if (!redirectParams || !redirectParams.target) {
      throw new Error(`Cannot perform redirect - the consuming route must add a parameter to the data prop named 'redirect', which ` +
    `must have the shape as ExternalRedirectData`);
    }

    /* Find the redirect method that makes sense for the supplied parameters. */
    const handlerSet = RedirectHandlerSets.find(redirectHandlerSet => {
      /* If this handler has not yet been instantiated, instantiate it now. */
      if (!redirectHandlerSet.instance) {
        redirectHandlerSet.instance = this.injector.get(redirectHandlerSet.type);
      }

      return redirectHandlerSet.instance.identify(redirectParams);
    });

    if (!handlerSet) {
      throw new Error(`Cannot perform redirect - the supplied redirect properties did not fit one of the required schemas.`);
    }

    /* Invoke the redirect method */
    handlerSet.instance.redirect(redirectParams);
  }
}

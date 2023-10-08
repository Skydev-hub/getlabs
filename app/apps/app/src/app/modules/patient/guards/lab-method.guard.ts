import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate, Route,
  Router,
  RouterStateSnapshot,
  UrlTree
} from '@angular/router';
import { Observable } from 'rxjs';
import { BookStep } from '../../../models/book-step.dto';
import { BookingFlowService } from '../services/booking-flow.service';

/**
 * Guard that examines whether or not the user has their lab order in hand.  If not, the user is redirected to
 * the doctor contact details form.
 */
@Injectable()
export class LabMethodGuard implements CanActivate {
  constructor(
    private bookingFlow: BookingFlowService,
    private router: Router,
  ) {}

  public canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    /* Iterate through the children of the activated node, until we can find the node that corresponds to the
     * lab order entry type indicated by the booking flow... */
    const getTarget = (routeConfig: Route): string[] => {
      /* Currently by design - route to the target node if any of the lab order details match the supplied provisioning method...
       * May need to be refined in the future as the booking flow continues to evolve. */
      if (routeConfig.data && routeConfig.data.labOrderType && !!this.bookingFlow.labOrderDetails.find(
        lod => routeConfig.data.labOrderType === lod.getLabOrderType())
      ) {
        return [routeConfig.path];
      }

      let r = null;

      for (let i = 0; !r && routeConfig.children && i < routeConfig.children.length; i++) {
        r = getTarget(routeConfig.children[i]);
        i++;
      }

      return r ? [routeConfig.path].concat(r) : null;
    };

    const target = getTarget(route.routeConfig);

    /* If no path can be resolved through the above means, throw an exception to indicate something went wrong. */
    if (!target || !target.length) {
      throw new Error('Unable to deduce lab order provisioning path from the current state of the booking flow.');
    }

    /* Form a base URL from the state on which this guard is placed (the state parameter will reflect the ultimate end
     * state that is intended to be activated, so this operation is necessary to distill the base state in the case that
     * a child node is navigated to directly. */
    const regex = new RegExp('.+\\/' + BookStep.LabOrderEntry);
    const baseUrl = regex.exec(state.url)[0];

    /* Assemble a resulting path based on the above resolution procedure, as well as the relative base path on which
     * this guard is placed. */
    const endPath = target.slice(1).reduce((path, targetSegment) => {
      return targetSegment ? `${ path }/${ targetSegment }` : path;
    }, baseUrl);

    return state.url.indexOf(endPath) === -1 ? this.router.parseUrl(endPath) : true;
  }
}

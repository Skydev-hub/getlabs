import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { LabCompany, LabLocationService, resolveLabCompanyAlias } from "@app/ui";
import { EMPTY, Observable, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class LabLocationCompanyResolver implements Resolve<LabCompany> {
  constructor(
    private readonly service: LabLocationService,
    private readonly router: Router,
    private readonly location: Location
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LabCompany> {
    return of(route.paramMap.get("lab")).pipe(
      map(value => resolveLabCompanyAlias(value)),
      catchError(() => {
        this.router.navigateByUrl("/_private/404");
        // Hack to display proper URL until Angular supports redirecting to a different component without
        // updating the location. See: https://github.com/angular/angular/issues/16981
        setTimeout(() => this.location.replaceState(state.url));
        return EMPTY;
      })
    );
  }
}

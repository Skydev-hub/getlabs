import { Location } from "@angular/common";
import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from "@angular/router";
import { LabLocationEntity, LabLocationService, resolveLabCompanyAlias } from "@app/ui";
import { EMPTY, Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class LabLocationBySlugResolver implements Resolve<LabLocationEntity> {
  constructor(
    private readonly service: LabLocationService,
    private readonly router: Router,
    private readonly location: Location
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<LabLocationEntity> {
    return this.service.readBySlug(resolveLabCompanyAlias(route.paramMap.get("lab")), route.paramMap.get("slug")).pipe(
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

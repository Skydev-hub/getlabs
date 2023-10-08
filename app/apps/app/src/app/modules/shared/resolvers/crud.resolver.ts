import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ICrudService } from '../interfaces/crud-service.interface';

@Injectable()
export abstract class CrudResolver<E> implements Resolve<E> {
  protected constructor(private service: ICrudService<E>, private router: Router, private location: Location) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<E> {
    return this.service.read(route.paramMap.get('id')).pipe(
      catchError(() => {
        this.router.navigateByUrl('/_private/404');
        // Hack to display proper URL until Angular supports redirecting to a different component without
        // updating the location. See: https://github.com/angular/angular/issues/16981
        setTimeout(() => this.location.replaceState(state.url));
        return EMPTY;
      })
    );
  }
}

import { Injectable, OnDestroy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { BehaviorSubject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FloatingNavService implements OnDestroy {

  open$ = new BehaviorSubject(false);

  router$: Subscription;

  constructor(router: Router) {
    this.router$ = router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.close();
      }
    });
  }

  ngOnDestroy(): void {
    this.router$.unsubscribe();
  }

  open() {
    this.open$.next(true);
  }

  close() {
    this.open$.next(false);
  }

  toggle() {
    this.open$.next(!this.open$.getValue());
  }
}

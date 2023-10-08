import { OverlayRef } from "@angular/cdk/overlay";
import { Component, OnDestroy } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import { Subscription } from "rxjs";

@Component({
  selector: "app-mobile-nav",
  templateUrl: "./mobile-nav.component.html",
  styleUrls: ["./mobile-nav.component.scss"],
  host: {
    "[class.open]": "true"
  }
})
export class MobileNavComponent implements OnDestroy {

  router$: Subscription;

  constructor(private router: Router, public overlay: OverlayRef) {
    this.router$ = router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.overlay.dispose();
      }
    });
  }

  ngOnDestroy(): void {
    this.router$.unsubscribe();
  }

}

import { Component } from "@angular/core";
import { Globals, OverlayService } from '@app/ui';
import { Covid19SafetyDialogComponent } from '../covid-19-safety/covid-19-safety-dialog.component';
import { MobileNavComponent } from "../mobile-nav/mobile-nav.component";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent {

  globals = Globals;

  Covid19SafetyDialogComponent = Covid19SafetyDialogComponent;

  constructor(public overlay: OverlayService) { }

  open() {
    this.overlay.open(MobileNavComponent, { closeOnBackdropClick: true });
  }
}

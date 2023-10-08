import { Component, ElementRef } from "@angular/core";
import { LabCompany } from '@app/ui';

@Component({
  selector: "app-home-hero",
  templateUrl: "./home-hero.component.html",
  styleUrls: ["./home-hero.component.scss"]
})
export class HomeHeroComponent {

  public LabCompany = LabCompany;

  constructor(private ref: ElementRef) {}

  scrollDown() {
    this.ref.nativeElement.nextSibling.scrollIntoView({ behavior: "smooth", block: "center" });
  }

}

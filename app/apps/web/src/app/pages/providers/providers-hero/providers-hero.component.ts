import { Component, ElementRef } from "@angular/core";

@Component({
  selector: "app-providers-hero",
  templateUrl: "./providers-hero.component.html",
  styleUrls: ["./providers-hero.component.scss"]
})
export class ProvidersHeroComponent {

  constructor(private ref: ElementRef) {}

  getStarted() {
    this.ref.nativeElement.parentNode.querySelector('#get-started').scrollIntoView({ behavior: "smooth", block: "start" });
  }

  scrollDown() {
    this.ref.nativeElement.nextSibling.scrollIntoView({ behavior: "smooth", block: "start" });
  }

}

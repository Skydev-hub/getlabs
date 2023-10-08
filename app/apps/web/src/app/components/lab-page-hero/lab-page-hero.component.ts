import { Component } from "@angular/core";
import { LabCompany } from "@app/ui";

@Component({
  selector: "app-lab-page-hero",
  templateUrl: "./lab-page-hero.component.html",
  styleUrls: ["./lab-page-hero.component.scss"],
})
export class LabPageHeroComponent {
  LabCompany = LabCompany;
}

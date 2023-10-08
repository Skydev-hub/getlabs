import { Component } from "@angular/core";
import { AuthService } from "../../services";

@Component({
  selector: "app-auth-state-btn",
  templateUrl: "./auth-state-btn.component.html",
  styleUrls: ["./auth-state-btn.component.scss"]
})
export class AuthStateBtnComponent {

  constructor(public auth: AuthService) { }

}

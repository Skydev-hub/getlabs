import { Component } from '@angular/core';
import { AuthService } from '@app/ui';

@Component({
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss']
})
export class SettingsPageComponent {

  constructor(private auth: AuthService) { }

  signOut() {
    this.auth.signOut('/');
  }

}

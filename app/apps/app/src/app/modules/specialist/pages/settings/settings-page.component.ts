import { Component, OnInit } from '@angular/core';
import { Globals } from '@app/ui';
import { AuthService } from '@app/ui';

@Component({
  templateUrl: './settings-page.component.html',
  styleUrls: ['./settings-page.component.scss']
})
export class SettingsPageComponent implements OnInit {

  globals = Globals;

  constructor(private auth: AuthService) { }

  ngOnInit() {
  }

  signOut() {
    this.auth.signOut('/');
  }

}

import { Component } from '@angular/core';
import { AuthService } from '@app/ui';

@Component({
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss']
})
export class DashboardPageComponent {

  constructor(private auth: AuthService) { }

  signOut() {
    this.auth.signOut('/');
  }

}

import { Component } from '@angular/core';
import { AuthService } from '@app/ui';

@Component({
  templateUrl: './not-found-page.component.html',
  styleUrls: ['./not-found-page.component.scss'],
})
export class NotFoundPageComponent {
  constructor(public readonly auth: AuthService) {}
}

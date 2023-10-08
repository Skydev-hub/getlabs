import { Component, Input } from '@angular/core';
import { Globals } from '../../globals';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  @Input()
  showHomeLink: boolean = false;

  @Input()
  showReferLink: boolean = false;

  date: Date = new Date();

  globals = Globals;

  constructor() {}
}

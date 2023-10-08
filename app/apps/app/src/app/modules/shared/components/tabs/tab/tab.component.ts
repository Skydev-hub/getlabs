import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tabs-tab',
  templateUrl: './tab.component.html',
  styleUrls: ['./tab.component.scss'],
  host: {
    '[class.active]': 'active',
  }
})
export class TabComponent {

  @Input()
  title: string;

  @Input()
  active = false;
}

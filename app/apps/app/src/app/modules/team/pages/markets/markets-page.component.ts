import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './markets-page.component.html',
  styleUrls: ['./markets-page.component.scss'],
})
export class MarketsPageComponent {
  search = new FormControl();
}

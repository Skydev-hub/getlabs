import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './labs-page.component.html',
  styleUrls: ['./labs-page.component.scss']
})
export class LabsPageComponent {
  search = new FormControl();
}

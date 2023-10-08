import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-instruction-bar',
  templateUrl: './instruction-bar.component.html',
  styleUrls: ['./instruction-bar.component.scss'],
  host: {
    '[class.open]': 'open'
  }
})
export class InstructionBarComponent {

  @Input()
  open = true;

  constructor() { }

  toggle(): void {
    this.open = !this.open;
  }

}

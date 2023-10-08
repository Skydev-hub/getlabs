import { Directive, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  /* eslint-disable-next-line @angular-eslint/directive-selector */
  selector: 'input[uppercase]',
})
export class UppercaseInputDirective implements OnInit {
  constructor(private readonly control: NgControl) {}

  ngOnInit() {
    this.control.valueChanges.subscribe((val) => this.control.control.setValue(String(val).toUpperCase(), { emitEvent: false }));
  }
}

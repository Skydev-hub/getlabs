import { Directive, ElementRef, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  /* eslint-disable-next-line @angular-eslint/directive-selector */
  selector: '[formControl], [formControlName]',
})
export class FormControlNativeElementDirective implements OnInit {
  constructor(private el: ElementRef, private control: NgControl) {}

  /**
   * Injects the native element in to each form control
   */
  ngOnInit(): void {
    (this.control.control as any).nativeElement = this.el.nativeElement;
  }
}

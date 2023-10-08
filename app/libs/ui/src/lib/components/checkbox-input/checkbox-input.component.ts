import { Component, ElementRef, EventEmitter, forwardRef, Host, Input, Optional, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormContainerDirective } from '../../directives/form-container.directive';

export class CheckboxChange {
  source: CheckboxInputComponent;
  checked: boolean;
}

@Component({
  selector: 'app-checkbox-input',
  templateUrl: './checkbox-input.component.html',
  styleUrls: ['./checkbox-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CheckboxInputComponent),
      multi: true,
    },
  ]
})
export class CheckboxInputComponent implements ControlValueAccessor {

  @ViewChild('input', { static: true })
  _inputElement: ElementRef<HTMLInputElement>;

  private _checked = false;

  @Input()
  get checked(): boolean {
    return this._checked;
  }

  set checked(value: boolean) {
    this._checked = !!value;
  }

  private _disabled = false;

  @Input()
  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
  }

  @Input()
  clickAction: 'check' | 'noop' = 'check';

  @Input()
  formControlName: string;

  @Input()
  optional: boolean;

  @Output()
  change: EventEmitter<CheckboxChange> = new EventEmitter<CheckboxChange>();


  private onChangedFn: (value: any) => void = () => {};

  private onTouchedFn: () => any = () => {};

  constructor(@Optional() @Host() private readonly formContainer: FormContainerDirective) { }

  toggle(): void {
    this.checked = !this.checked;
    this.onChangedFn(this.checked);
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChangedFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: boolean): void {
    this.checked = !!value;
  }

  onChange(event: Event) {
    event.stopPropagation();
  }

  onClick(event: Event) {
    event.stopPropagation();
    if (!this.disabled) {
      if (this.clickAction === 'noop') {
        this._inputElement.nativeElement.checked = this.checked;
      } else {
        this.toggle();
        this.onChangedFn(this.checked);
      }

      this.change.emit({
        source: this,
        checked: this.checked,
      });
    }
  }

  isOptional() {
    if(this.optional === undefined) {
      return this.formContainer && this.formControlName && !this.formContainer.isRequired(this.formControlName);
    }
    return this.optional;
  }

}

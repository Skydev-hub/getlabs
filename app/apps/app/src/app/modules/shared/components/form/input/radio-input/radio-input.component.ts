import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { ChangeDetectorRef, Component, ContentChildren, Directive, forwardRef, Input, OnDestroy, OnInit, Optional, Output, QueryList } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

// Increasing integer for generating unique ids for radio components.
let nextUniqueId = 0;

export enum RadioButtonStyle {
  DEFAULT = 'default',
  BOX = 'box'
}

@Directive({
  selector: 'app-radio-group',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioGroupDirective),
      multi: true,
    },
  ]
})
export class RadioGroupDirective implements OnInit, ControlValueAccessor {

  private _value: any = null;

  private _name = `radio-group-${ nextUniqueId++ }`;

  private _selected: RadioInputComponent | null = null;

  private _disabled = false;

  @ContentChildren(forwardRef(() => RadioInputComponent), { descendants: true })
  private _buttons: QueryList<RadioInputComponent>;

  @Input()
  public buttonStyle: RadioButtonStyle;

  public buttonStyles = RadioButtonStyle;

  @Input()
  @Input()
  get value(): any {
    return this._value;
  }

  set value(newValue: any) {
    if (this._value !== newValue) {
      // Set this before proceeding to ensure no circular loop occurs with selection.
      this._value = newValue;

      this._updateSelectedRadioFromValue();
      this._checkSelectedRadioButton();
    }
  }

  @Input()
  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
    this._updateRadioButtonNames();
  }

  @Input()
  get selected() {
    return this._selected;
  }

  set selected(selected) {
    this._selected = selected;
    this.value = selected ? selected.value : null;
    this._checkSelectedRadioButton();
  }

  @Input()
  get disabled(): boolean { return this._disabled; }

  set disabled(value) {
    this._disabled = coerceBooleanProperty(value);
    this._markRadiosForCheck();
  }

  onChangedFn: (value: any) => void = () => {};

  onTouchedFn: () => any = () => {};

  constructor(private _changeDetector: ChangeDetectorRef) {
    this.buttonStyle = this.buttonStyle || RadioButtonStyle.DEFAULT;
  }

  _checkSelectedRadioButton() {
    if (this._selected && !this._selected.checked) {
      this._selected.checked = true;
    }
  }

  _markRadiosForCheck() {
    if (this._buttons) {
      this._buttons.forEach(button => button._markForCheck());
    }
  }

  private _updateRadioButtonNames(): void {
    if (this._buttons) {
      this._buttons.forEach(button => {
        button.name = this.name;
        button._markForCheck();
      });
    }
  }

  private _updateSelectedRadioFromValue(): void {
    // If the value already matches the selected radio, do nothing.
    const isAlreadySelected = this._selected !== null && this._selected.value === this._value;

    if (this._buttons && !isAlreadySelected) {
      this._selected = null;
      this._buttons.forEach(radio => {
        radio.checked = this.value === radio.value;
        if (radio.checked) {
          this._selected = radio;
        }
      });
    }
  }

  ngOnInit() {}

  registerOnChange(fn: (value: any) => void): void {
    this.onChangedFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  writeValue(value: any) {
    this.value = value;
    this._changeDetector.markForCheck();
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

}


@Component({
  selector: 'app-radio-input',
  templateUrl: './radio-input.component.html',
  styleUrls: ['./radio-input.component.scss'],
})
export class RadioInputComponent implements OnInit, OnDestroy {

  @Input()
  id = `radio-${ ++nextUniqueId }`;

  @Input()
  name: string;

  @Input()
  get value(): any {
    return this._value;
  }

  set value(value: any) {
    if (this._value !== value) {
      this._value = value;
      if (this.group) {
        if (!this.checked) {
          // Update checked when the value changed to match the radio group's value
          this.checked = this.group.value === value;
        }
        if (this.checked) {
          this.group.selected = this;
        }
      }
    }
  }

  @Input()
  @Input()
  get checked(): boolean {
    return this._checked;
  }

  set checked(value: boolean) {
    value = coerceBooleanProperty(value);
    if (this._checked !== value) {
      this._checked = value;

      if (this.group) {
        if (this.checked && this.group.value !== this.value) {
          this.group.selected = this;
        } else if (!this.checked && this.group.value === this.value) {
          this.group.selected = null;
        }
      }

      if (this.checked) {
        this._selectionDispatcher.notify(this.id, this.name);
      }
    }
  }

  @Input()
  @Input()
  get disabled(): boolean {
    return this._disabled || (this.group && this.group.disabled);
  }

  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);
  }

  private _checked = false;

  private _disabled = false;

  private _value: any = null;

  private _removeUniqueSelectionListener: () => void = () => {};

  constructor(
    @Optional() public group: RadioGroupDirective,
    private _changeDetector: ChangeDetectorRef,
    private _selectionDispatcher: UniqueSelectionDispatcher
  ) {
    this._removeUniqueSelectionListener =
      _selectionDispatcher.listen((id: string, name: string) => {
        if (id !== this.id && name === this.name) {
          this.checked = false;
        }
      });
  }

  /**
   * Marks the radio button as needing checking for change detection.
   * This method is exposed because the parent radio group will directly
   * update bound properties of the radio button.
   */
  _markForCheck() {
    // When group value changes, the button will not be notified. Use `markForCheck` to explicit
    // update radio button's status
    this._changeDetector.markForCheck();
  }

  ngOnInit(): void {
    if (this.group) {
      this.checked = this.group.value === this._value;
      this.name = this.group.name;
    }
  }

  ngOnDestroy() {
    this._removeUniqueSelectionListener();
  }

  onChange(event: Event) {
    event.stopPropagation();
  }

  onClick(event: Event) {
    event.stopPropagation();

    this.checked = true;

    if (this.group) {
      this.group.onChangedFn(this.value);
    }
  }

}

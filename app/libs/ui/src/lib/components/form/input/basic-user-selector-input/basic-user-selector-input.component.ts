import { Component, EventEmitter, Input, OnInit, Output, Type } from '@angular/core';
import { ControlValueAccessor, FormControl } from '@angular/forms';
import { X_HEADER_MARKETS } from '../../../../constants';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MarketEntity, User } from '../../../../models';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-basic-user-selector-input',
  templateUrl: './basic-user-selector-input.component.html',
  styleUrls: ['./basic-user-selector-input.component.scss'],
})
export class BasicUserSelectorInputComponent implements OnInit, ControlValueAccessor {

  @Input()
  type: Type<User>;

  @Input()
  market: MarketEntity;

  @Output()
  user: EventEmitter<User> = new EventEmitter<User>();

  users$: Observable<User[]>;

  input: FormControl;

  disabled: boolean = false;

  private onTouched: () => void = () => {
  };

  constructor(private readonly users: UserService) {
    this.input = new FormControl();
    this.input.valueChanges.subscribe(v => {
      this.user.emit(v);
    });
  }

  ngOnInit() {
    // TODO: This should be updated to include more than just the first page
    this.users$ = this.users.getService(this.type).list(undefined, {
      headers: {
        ...(this.market && { [X_HEADER_MARKETS]: this.market.code }),
      },
    }).pipe(map(resp => resp.data));
  }

  registerOnChange(fn: (value: Type<User>) => void): void {
    this.input.valueChanges.subscribe((v) => {
      fn(v);
    });
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  writeValue(value: Type<User>): void {
    this.input.setValue(value);
  }
}

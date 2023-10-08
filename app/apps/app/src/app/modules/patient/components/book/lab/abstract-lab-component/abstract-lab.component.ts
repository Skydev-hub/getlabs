import { EventEmitter, Output, Directive } from '@angular/core';
import { LabOrderDetailsEntity } from '@app/ui';
import { DeepPartial } from 'ts-essentials';

/**
 * Parent class for all patient lab collection components - the purpose of this is to expose
 * a common interface for submitting the lab order collection preferences.
 */
@Directive()
/* eslint-disable-next-line @angular-eslint/directive-class-suffix */
export class AbstractLabComponent {
  /* eslint-disable-next-line @angular-eslint/no-output-native */
  @Output()
  public submit = new EventEmitter<DeepPartial<LabOrderDetailsEntity>[]>();
}

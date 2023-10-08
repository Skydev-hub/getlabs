import { Directive, Input, OnDestroy, TemplateRef, ViewContainerRef } from '@angular/core';
import { Address, LabLocationService } from '@app/ui';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appIfAddressIsLab]'
})
export class IfAddressIsLabDirective implements OnDestroy {
  private _req$: Subscription;
  private _address: Address;
  private _elseTemplate: TemplateRef<any>;

  @Input('appIfAddressIsLab')
  set address(address: Address) {
    const changed = !this._address || (this._address.zipCode !== address.zipCode || this._address.street !== address.street);
    this._address = address;
    if (changed) {
      this._updateView();
    }
  }

  @Input('appIfAddressIsLabElse')
  set elseTemplate(template: TemplateRef<any>) {
    this._elseTemplate = template;
  }

  constructor(private container: ViewContainerRef, private template: TemplateRef<any>, private readonly labLocationService: LabLocationService) {}

  private _updateView() {
    this._unsubscribe();
    this._req$ = this.labLocationService.listByAddress(this._address).subscribe(data => {
      this.container.clear();
      if (data.total && data.total > 0) {
        this.container.createEmbeddedView(this.template);
      } else if (this._elseTemplate) {
        this.container.createEmbeddedView(this._elseTemplate);
      }
    });
  }

  private _unsubscribe() {
    if (this._req$) {
      this._req$.unsubscribe();
    }
  }

  ngOnDestroy() {
    this._unsubscribe();
  }
}

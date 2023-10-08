import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: 'ng-template[appPartnerInlineContentBlock]'
})
export class PartnerInlineContentBlock {
  @Input('appPartnerInlineContentBlock')
  public set partner(partner: string) {
    /* If the supplied partner string is not a populated string, then simply assign null. */
    this._partner = partner && typeof partner === 'string' ?
      partner : null;
  }

  public get partner() {
    return this._partner;
  }

  private _partner: string;

  constructor(public readonly templateRef: TemplateRef<any>) { }
}

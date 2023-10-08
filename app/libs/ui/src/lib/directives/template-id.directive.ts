import { Directive, Input, TemplateRef } from '@angular/core';

/**
 * A helper directive that allows consumers to assign an ID to a template-ref element.
 * This is helpful in cases where you need to select a template by a given handle.
 */
@Directive({
  selector: 'ng-template[appTemplateId]'
})
export class TemplateIdDirective {
  @Input('appTemplateId')
  public templateId: string;

  constructor(public readonly templateRef: TemplateRef<any>) { }
}

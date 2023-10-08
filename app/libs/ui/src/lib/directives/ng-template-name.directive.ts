import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  /* eslint-disable-next-line @angular-eslint/directive-selector */
  selector: 'ng-template[templateData], ng-template[name][templateData], ng-template[name]',
})
export class NgTemplateNameDirective {
  @Input()
  public templateData: any;

  @Input()
  public name: string;

  constructor(public templateRef: TemplateRef<any>) {}
}

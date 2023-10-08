import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';

/**
 * Directive that implements template-only variables - useful in cases where we're dealing with fully asynchronous logical components.
 */
@Directive({
  selector: '[appTemplateVariable]',
})
export class TemplateVariableDirective implements OnInit {
  public context: {
    appTemplateVariable: any;
    $implicit: any;
  } = {
    appTemplateVariable: null,
    $implicit: null,
  };

  constructor(private readonly viewContainerRef: ViewContainerRef, private readonly templateRef: TemplateRef<any>) {}

  ngOnInit(): void {
    /* Clear the view container created by this structural directive instance, and create a new embedded view with the contained
     * template, bound to the directive's context. */
    this.viewContainerRef.clear();
    this.viewContainerRef.createEmbeddedView(this.templateRef, this.context);
  }

  @Input('appTemplateVariable')
  set templateVar(expressionResult: any) {
    /* Set the inbound structural expression result to the properties of our local context object - these properties
     * will be read by the template engine to carry out the supplied expression (which would presumably assign the result of an
     * embedded expression(s) to the embedded variable(s), via implicit aliasing of the directive's expression result to the
     * assigned template variable reference in the consumer's expression syntax. */
    this.context.appTemplateVariable = expressionResult;
    this.context.$implicit = expressionResult;
  }
}

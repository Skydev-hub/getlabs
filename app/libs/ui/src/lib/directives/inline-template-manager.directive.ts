import { AfterContentInit, ChangeDetectorRef, ContentChildren, Directive, forwardRef, QueryList } from '@angular/core';
import { NgTemplateNameDirective } from './ng-template-name.directive';

@Directive({
  selector: '[appInlineTemplateManager]'
})
export class InlineTemplateManagerDirective implements AfterContentInit {
  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  /* The forwardRef is necessary due to the brittle way Angular structures directive dependencies... */
  @ContentChildren(forwardRef(() => NgTemplateNameDirective), { descendants: true })
  public ngTemplates: QueryList<NgTemplateNameDirective>;

  getTemplate(name: string) {
    /* Return the template that corresponds to the supplied state. */
    const result = this.ngTemplates && name ? this.ngTemplates.find(templateRef => templateRef.name === name) : null;

    return result && result.templateRef;
  }

  ngAfterContentInit(): void {
    /* Required as this directive relies on elements that will *not* be available in the initialization lifecycle hook.  We must
     * ensure that these items have been initialized before we're finished with detecting changes on init. */
    this.changeDetectorRef.detectChanges();
  }
}

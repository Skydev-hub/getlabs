import { AfterContentChecked, Directive, ElementRef, Input, OnInit, Renderer2, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  /* eslint-disable-next-line @angular-eslint/directive-selector */
  selector: '[noContent]',
})
export class NoContentDirective implements OnInit, AfterContentChecked {
  @Input()
  noContent: TemplateRef<any>;

  private readonly element: HTMLElement;
  private hasContent = true;

  constructor(element: ElementRef, private container: ViewContainerRef, private renderer: Renderer2) {
    this.element = element.nativeElement;
  }

  ngOnInit() {
    this.renderer.addClass(this.element, 'ng-content');
  }

  ngAfterContentChecked(): void {
    let hasContent = false;
    for (let i = this.element.childNodes.length - 1; i >= 0; --i) {
      const node = this.element.childNodes[i];
      if (node.nodeType === 1 || node.nodeType === 3) {
        hasContent = true;
        break;
      }
    }
    if (hasContent !== this.hasContent) {
      this.hasContent = hasContent;
      Promise.resolve().then(() => {
        if (hasContent) {
          this.renderer.removeClass(this.element, 'ng-content__is-empty');
          this.container.clear();
        } else {
          this.renderer.addClass(this.element, 'ng-content__is-empty');
          this.container.createEmbeddedView(this.noContent);
        }
      });
    }
  }
}

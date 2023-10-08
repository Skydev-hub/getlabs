import { isPlatformServer } from '@angular/common';
import { Directive, Inject, Input, OnInit, PLATFORM_ID, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  /* eslint-disable-next-line @angular-eslint/directive-selector */
  selector: '[serverRender]',
})
export class ServerRenderDirective implements OnInit {
  @Input('serverRender')
  render: boolean = true;

  constructor(private viewContainer: ViewContainerRef, private templateRef: TemplateRef<any>, @Inject(PLATFORM_ID) private platformId) {}

  ngOnInit() {
    if (this.render === false && isPlatformServer(this.platformId)) {
      this.viewContainer.clear();
    } else {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }
}

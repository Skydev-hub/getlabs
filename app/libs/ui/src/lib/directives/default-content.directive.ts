import {
  AfterContentChecked,
  Directive,
  EmbeddedViewRef,
  Input, OnDestroy,
  OnInit,
  TemplateRef,
  ViewContainerRef
} from '@angular/core';

@Directive({
  selector: '[appDefaultContent]'
})
export class DefaultContentDirective implements AfterContentChecked, OnInit, OnDestroy {
  @Input('appDefaultContent')
  private defaultContentTplRef: TemplateRef<any>;

  private embeddedTplViewRef: EmbeddedViewRef<any>;

  private currentViewRef: EmbeddedViewRef<any>;

  private hasContent: boolean;

  constructor(
    private container: ViewContainerRef,
    private tplRef: TemplateRef<any>,
  ) {}

  ngOnInit(): void {
    /* Create a view reference for the embedded content - this will be used to assess whether or not nodes exist underneath
     * the embedded content. */
    this.embeddedTplViewRef = this.tplRef.createEmbeddedView(null);
  }

  ngOnDestroy(): void {
    /* If a dynamic view ref presently exists, ensure that it is removed from the change detection process... */
    if (this.currentViewRef) {
      this.currentViewRef.detach();
    }
  }


  ngAfterContentChecked(): void {
    /* Determine whether or not this component has embedded content - if it does, we need to ensure that the embedded
     * content is displayed; if not, we need to ensure that the default content provided via appDefaultContent is displayed. */
    const hasContent = this.embeddedTplViewRef.rootNodes.some(childNode => {
      return childNode.nodeType === 1 || childNode.nodeType === 3;
    });

    /* Change detected - determine which template we need to load... */
    if (this.hasContent !== hasContent) {
      /* If a current view ref exists, ensure that it is removed from the change detection loop */
      if (this.currentViewRef) {
        this.currentViewRef.detach();
      }

      /* Clear the existing container, and update the value of hasContent */
      this.container.clear();
      this.hasContent = hasContent;

      /* Dynamically insert the template based on whether or not embedded template elements are present... */
      this.currentViewRef = this.container.createEmbeddedView(this.hasContent ?
        this.tplRef : this.defaultContentTplRef);

      if (this.hasContent) {
        this.embeddedTplViewRef = this.currentViewRef;
      }

      this.currentViewRef.detectChanges();
    }
  }
}

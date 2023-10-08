import { CdkAccordionItem } from '@angular/cdk/accordion';
import { UniqueSelectionDispatcher } from '@angular/cdk/collections';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, Optional, PLATFORM_ID, SkipSelf, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import * as slug from 'slug';
import { AccordianComponent } from '../accordian/accordian.component';

@Component({
  selector: 'app-expansion-panel',
  templateUrl: './expansion-panel.component.html',
  styleUrls: ['./expansion-panel.component.scss'],
  host: {
    '[class.active]': 'expanded',
  },

  // Needed to inherit inputs/outputs from subclass
  inputs: ['expanded', 'disabled'],
  outputs: ['closed', 'opened'],
})
export class ExpansionPanelComponent extends CdkAccordionItem implements AfterViewInit, OnDestroy {
  // @Input()
  // chevronAlignment: 'left' | 'right' = 'right';

  @ViewChild('title', { read: ElementRef })
  title: ElementRef;

  slug: string;

  constructor(
    @Optional() @SkipSelf() public readonly accordion: AccordianComponent,
    private readonly _changeDetector: ChangeDetectorRef,
    private readonly _selectionDispatcher: UniqueSelectionDispatcher,
    private _element: ElementRef,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    super(accordion, _changeDetector, _selectionDispatcher);
  }

  ngAfterViewInit() {
    this.slug = slug(this.title.nativeElement.textContent, slug.defaults.modes.rfc3986);

    this.opened.subscribe((val) => {
      if (this.accordion) {
        this.accordion.opened.next(this);
      }
    });

    this.closed.subscribe((val) => {
      if (this.accordion) {
        this.accordion.closed.next(this);
      }
    });

    if (this.accordion) {
      this.accordion.currentSlug.pipe(takeUntil(this.destroyed)).subscribe((val) => {
        if (val === this.slug) {
          setTimeout(() => {
            this.open();
          });
        }
      });
    }
  }
}

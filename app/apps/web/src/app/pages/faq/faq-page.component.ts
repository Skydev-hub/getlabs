import { isPlatformBrowser, Location } from '@angular/common';
import { AfterViewInit, ApplicationRef, Component, ElementRef, Inject, NgZone, PLATFORM_ID, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccordianComponent, Globals } from '@app/ui';
import { first } from 'rxjs/operators';


interface FaqEntry {
  title: string;
  content: string;
}

@Component({
  templateUrl: './faq-page.component.html',
  styleUrls: ['./faq-page.component.scss'],
})
export class FaqPageComponent implements AfterViewInit {

  globals = Globals;

  @ViewChild(AccordianComponent, { static: true })
  accordion: AccordianComponent;

  constructor(
    @Inject(PLATFORM_ID) private readonly platformId: Object,
    private readonly appRef: ApplicationRef,
    private readonly ngZone: NgZone,
    private route: ActivatedRoute,
    private location: Location,
    private ref: ElementRef,
  ) { }

  ngAfterViewInit() {
    this.route.params.subscribe(p => {
      this.accordion.openPanelForSlug(p.slug);
    });

    this.accordion.openPanel.subscribe(panel => {
      this.location.replaceState(panel ? `/faq/${ panel.slug }` : '/faq');
    });

    // Scroll to first open panel on initial page load
    if (isPlatformBrowser(this.platformId)) {
      this.appRef.isStable.pipe(
        first(stable => stable),
      ).subscribe(() => this.ngZone.run(() => {
        const active = this.ref.nativeElement.parentNode.querySelector('app-expansion-panel.active');
        if (active) {
          active.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }));
    }

  }

}

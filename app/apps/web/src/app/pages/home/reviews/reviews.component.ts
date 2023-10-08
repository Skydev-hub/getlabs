import { isPlatformBrowser } from '@angular/common';
import { AfterViewInit, ApplicationRef, Component, ElementRef, Inject, NgZone, OnDestroy, PLATFORM_ID, Renderer2, ViewChild } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import { delay, first } from 'rxjs/operators';

@Component({
  selector: 'app-reviews',
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss'],
})
export class ReviewsComponent implements AfterViewInit, OnDestroy {
  constructor(
    private readonly renderer: Renderer2,
    @Inject(PLATFORM_ID) private readonly platformId: string,
    private readonly appRef: ApplicationRef,
    private readonly zone: NgZone,
  ) {}

  customerQuotes = [
    {
      text: 'When I found out Getlabs was an option, I was like \'really, why has no one does this before?\'',
      by: 'Patient in Arizona',
    },
    {
      text: 'I loved not having to sit in a waiting room; they just came to me and were in and out in just a few minutes.',
      by: 'Patient in Arizona',
    },
    {
      text: 'My parents hate leaving the house with COVID-19 going around and Getlabs made it safe and easy.',
      by: 'Patient in Arizona',
    },
    {
      text: 'It’s so much more convenient than the old way. Getlabs just comes to you.',
      by: 'Patient in Arizona',
    },
    {
      text: 'I just uploaded my lab order, picked a time, and they came to my house and drew my blood work. Super easy!',
      by: 'Patient in Arizona',
    },
    {
      text: 'I actually liked how relaxing the whole experience felt. They care about your wellbeing and put your mind at ease.',
      by: 'Patient in Arizona'
    }
  ];

  private subscription: Subscription;
  activeSlide = 0;

  @ViewChild('quotesContainer', { read: ElementRef, static: true }) quotesContainer: ElementRef;

  ngAfterViewInit(): void {
    // 1. The application never becomes stable if you run async tasks on application start. The carousel must be started after the application
    //    becomes stable or it will block the application from ever becoming stable.
    // 2. isStable runs outside the angular zone
    //
    // See: https://angular.io/api/core/ApplicationRef#isstable-examples-and-caveats
    this.appRef.isStable.pipe(
      first(stable => stable)
    ).subscribe(() => this.zone.run(() => this.startCarousel()))
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  startCarousel(firstDelay: number = 0): void {
    /* If an active carousel is running, stop it now. */
    this.stopCarousel();

    if (isPlatformBrowser(this.platformId)) {
      this.subscription = interval(5000).pipe(delay(firstDelay)).subscribe(() => this.goToNextSlide());
    }
  }

  stopCarousel(): void {
    if (isPlatformBrowser(this.platformId) && this.subscription instanceof Subscription) {
      this.subscription.unsubscribe();
    }
  }

  goToSlide(index: number): void {
    /* Only perform transitions if the supplied index is different from the active slide */
    if (index !== this.activeSlide) {
      /* Calculate a transition duration that is appropriate for the number of quotes we are traversing. */
      const transitionLength = 500 + ((Math.abs(index - this.activeSlide) - 1) * 150);
      this.renderer.setStyle(this.quotesContainer.nativeElement, 'transition', `all ${ transitionLength }ms ease-in-out`);

      /* Apply horizontal translation */
      this.renderer.setStyle(this.quotesContainer.nativeElement, 'transform', `translate3d(-${ index!==this.customerQuotes.length ? 100 * index : 0 }%, 0, 1px)`);
      this.activeSlide = index;
    }

    this.startCarousel(3000);
  }

  goToNextSlide(): void {
    /* Go to the first slide if the carousel is currently on the last slide. */
    this.goToSlide(this.activeSlide < (this.customerQuotes.length - 1) ? this.activeSlide + 1 : 0);
  }


}

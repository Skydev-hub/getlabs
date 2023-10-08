import { DOCUMENT } from '@angular/common';
import { Directive, HostListener, Inject, Input } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  /* eslint-disable-next-line @angular-eslint/directive-selector */
  selector: 'a[href]',
  host: {
    '[attr.href]': 'this.href',
  },
})
export class HrefDirective {
  @Input()
  href: string;

  @Input()
  target: string;

  constructor(@Inject(DOCUMENT) private document: Document, private readonly router: Router) {}

  @HostListener('click')
  onClick() {
    if (this.isInternalLink()) {
      this.router.navigateByUrl(this.url.href.slice(this.url.origin.length));
      return false;
    }
  }

  get url(): URL {
    try {
      return new URL(this.href);
    } catch (err) {
      return new URL(`${this.document.location.origin}${this.href}`);
    }
  }

  private isInternalLink() {
    return this.url.origin === this.document.location.origin && (!this.target || this.target === '_self');
  }
}

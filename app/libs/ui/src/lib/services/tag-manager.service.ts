import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, Renderer2, RendererFactory2, PLATFORM_ID } from '@angular/core';
import { environment } from '@app/shared/environments';
import { WindowRef } from '../utils';


@Injectable({
  providedIn: 'root',
})
export class TagManagerService {

  scriptElRef: any;

  renderer: Renderer2;

  constructor(
    @Inject(PLATFORM_ID) private platformId: any,
    @Inject(DOCUMENT) private readonly document: Document,
    private readonly window: WindowRef,
    rendererFactory: RendererFactory2,
  ) {
    this.renderer = rendererFactory.createRenderer(null, null);
  }

  init(): void {
    if (this.scriptElRef) return;

    this.getDataLayer().push({
      'gtm.start': new Date().getTime(),
      'event': 'gtm.js',
    });

    this.scriptElRef = this.renderer.createElement('script');
    this.scriptElRef.src = `https://www.googletagmanager.com/gtm.js?id=${ environment.googleTagManagerId }`;
    this.scriptElRef.async = true;

    this.renderer.insertBefore(this.document.head, this.scriptElRef, this.document.head.firstChild);
  }

  getDataLayer(): object[] {
    if(isPlatformBrowser(this.platformId)) {
      this.window.nativeWindow['dataLayer'] = this.window.nativeWindow['dataLayer'] || [];
      return this.window.nativeWindow['dataLayer'];
    }

    return [];
  }

}

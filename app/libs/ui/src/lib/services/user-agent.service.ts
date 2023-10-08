import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UserAgentService {
  private _isCrawler: boolean;

  public getUserAgent(): string {
    return window.navigator.userAgent;
  }

  public isCrawler(): boolean {
    if (this._isCrawler === undefined) {
      this._isCrawler = /bot|crawler|spider|crawling/i.test(this.getUserAgent());
    }
    return this._isCrawler;
  }
}

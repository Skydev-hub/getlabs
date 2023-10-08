import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MarketService, X_HEADER_MARKETS } from '@app/ui';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';

@Injectable()
export class MarketInterceptorService implements HttpInterceptor {
  constructor(private readonly marketService: MarketService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    /* Active markets is asynchronous - we must view the market service's exposed observable in order to gather this data. */
    return this.marketService.getActiveMarkets$().pipe(
      /* Take only 1 result to ensure that we don't accidentally fire multiple HTTP requests */
      take(1),

      /* If active markets are defined, add them as a header. */
      switchMap(markets => {
        /* HttpRequest and HttpHeader objects are immutable */

        // 1. If it already has the header but its blank, remove it
        // 2. If it doesn't have the header but needs it, add it
        if (req.headers.has(X_HEADER_MARKETS)) {
          if (!req.headers.get(X_HEADER_MARKETS)) {
            req = req.clone({
              headers: req.headers.delete(X_HEADER_MARKETS),
            });
          }
        } else {
          if (markets && markets.length) {
            req = req.clone({
              headers: req.headers.set('X-Markets', markets.map(market => market.code)),
            });
          }
        }

        return next.handle(req);
      }));
  }
}

import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { environment } from '@app/shared/environments';
import { head, reduce } from 'lodash-es';

type Path = string | string[];

@Injectable({
  providedIn: 'root',
})
export class ConfigurationService {

  private _domain: string;

  constructor(@Inject(DOCUMENT) private readonly document: Document) {}

  /**
   * Determines the longest matching app domain based on the hostname.
   *
   * Uses the first domain available if none match.
   */
  getDomain(): string {
    if (!this._domain) {
      const hostname = this.document.location.hostname;
      const domains = environment.domains;
      this._domain = reduce(domains, (res, val) => {
        return hostname.endsWith(val) && (val.length > res.length || !res.endsWith(val)) ? val : res;
      }, head(domains));
    }

    return this._domain;
  }

  getCookieDomain(): string {
    return `.${ this.getDomain() }`;
  }

  getApiEndPoint(path?: Path): string {
    return this.determineURL(path, 'api');
  }

  getStaticEndPoint(path?: Path): string {
    return this.determineURL(path, 'static');
  }

  determineURL(path?: Path, subdomain?: string): string {
    return 'https://' + [
      [subdomain, this.getDomain()].filter(Boolean).join('.'),
      this.determineURLPath(path),
    ].filter(Boolean).join('/');
  }

  determineURLPath(path?: Path): string | undefined {
    path = Array.isArray(path) ? path : [path];
    return path.map(p => p ? (p.startsWith('/') ? p.substring(1) : p) : undefined).filter(Boolean).join('/');
  }
}

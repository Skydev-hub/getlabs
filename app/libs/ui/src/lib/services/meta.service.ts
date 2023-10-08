import { Injectable, InjectionToken, Injector, Type } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { isEqual, merge } from 'lodash-es';
import { Reflect } from 'core-js';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, filter, map } from 'rxjs/operators';

/* Used by routing definitions to describe meta data properties that need to be resolved dynamically. */
export interface DynamicMetaData {
  getData: Function;
}

type MetaDataProperty = DynamicMetaData | string;

interface MetaData {
  [k: string]: MetaDataProperty;
}

/**
 * Tracks injection token parameters defined via the MetadataInject decorator.
 */
interface InjectionTokenParameters {
  index: number;
  token: InjectionToken<any>;
}

/**
 * Retrieves the metadata key for the injection method parameter mapped to the supplied paramIndex...
 */
const getInjectionMetaKey = (paramIndex: number) => {
  return `injection:parameters:${ paramIndex }`;
};

/**
 * Decorator for marking a given DynamicMetaData#getData parameter as injectable via a different token than its class type.
 */
export function MetadataInject(token: InjectionToken<any>) {
  return function(target: Type<DynamicMetaData>, name: string, index: number) {
    Reflect.defineMetadata(getInjectionMetaKey(index), { index, token }, target);
  }
}

@Injectable({
  providedIn: 'root'
})
export class MetaService {

  private static readonly title = 'Getlabs';

  meta$: Subscription;

  tags: string[] = [];

  constructor(
    private readonly title: Title,
    private readonly meta: Meta,
    private readonly router: Router,
    private readonly injector: Injector,
  ) {}

  start(): void {
    this.meta$ = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(() => this.gatherMeta(this.router.routerState.root)),
      distinctUntilChanged(isEqual),
    ).subscribe(data => this.apply(data));
  }

  stop(): void {
    this.meta$.unsubscribe();
  }

  apply(data: MetaData): void {
    this.reset();

    if (data) {
      Object.keys(data).forEach(key => {
        /* We may need to dynamically resolve the value via what is defined in the router. */
        const value = this.getMetaData(data[key]);

        switch (key) {
          case 'title':
            this.setTitle(value);
            break;
          default:
            this.setTag(key, value);
        }
      });
    }
  }

  reset(): void {
    // Remove tags first, because og:title tag will get removed and set again in setTitle()
    this.tags.forEach(selector => this.meta.removeTag(selector));
    this.setTitle(MetaService.title);
  }

  private getMetaData(data: MetaDataProperty) {
    /* Default case - take the data as a string */
    let result: string = data as string;

    /* If data is an object, we will need to run the object's getData function through the injector, and use
     * the resulting value as the title */
    if (typeof data === 'object') {
      /* Resolve the dependencies that are listed in this function's parameters */
      const proto = Reflect.getPrototypeOf(data);
      const types = Reflect.getMetadata('design:paramtypes', proto, data.getData.name);

      /* Resolve all dependencies upon invocation */
      const deps = types.map((arg, index) =>  {
        /* Check to see if there's a token mapping to this index. */
        const metadataToken: InjectionTokenParameters = Reflect.getMetadata(getInjectionMetaKey(index), proto);
        const token = (metadataToken && metadataToken.token) || arg;

        return this.injector.get(token)
      });

      /* Execute the supplied function */
      result = data.getData(...deps);
    }

    return result;
  }

  setTitle(title: string, suffix = MetaService.title, separator = ' - '): void {
    title = [title, suffix].filter(Boolean).join(separator);
    this.title.setTitle(title);
    this.setTag('og:title', title);
  }

  setTag(key: string, value: string): void {
    if (key.lastIndexOf('og:', 0) === 0) {
      this.meta.updateTag({
        property: key,
        content: value,
      });
      this.addTagSelector(`property="${ key }"`);
    } else {
      this.meta.updateTag({
        name: key,
        content: value,
      });
      this.addTagSelector(`name="${ key }"`);

      // Alias some tags for ease of use
      switch (key) {
        case 'author':
          this.setTag('og:author', value);
          break;
        case 'publisher':
          this.setTag('og:publisher', value);
          break;
      }
    }
  }

  // ---

  private addTagSelector(key: string): void {
    if (!this.tags.includes(key)) {
      this.tags.push(key);
    }
  }

  /**
   * Recursively merges meta data of activated routes to get a full picture of meta data from itself and parent routes
   */
  private gatherMeta(route: ActivatedRoute): MetaData {
    const meta = {};

    merge(meta, route.snapshot.data.meta);

    if (route.firstChild) {
      merge(meta, this.gatherMeta(route.firstChild));
    }

    return meta;
  }

}

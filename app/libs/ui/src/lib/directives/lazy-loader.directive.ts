import {
  Directive,
  Injector,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  Type,
  ViewContainerRef
} from '@angular/core';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { Reflect } from 'core-js';
import { filter, take } from 'rxjs/operators';

const LazyLoaderMetadataKey = 'LazyLoaderMetadataKey';

/**
 * Internal interface describing the general shape of an individual lazy loader handler index.
 */
interface LazyLoaderHandlerIndex {
  type: Type<LazyLoaderHandler>;
  instance?: LazyLoaderHandler;
}

/**
 * External interface to be implemented by classes decorated with LazyLoader.
 */
export interface LazyLoaderHandler {
  load(): Observable<boolean>;
}

/**
 * Decorator that marks a given class as a lazy load handler.  The parameter indicates the component that should be lazy loaded
 * according to the specifications implemented by the decorated class.
 */
export function LazyLoader<T>(component: Type<T>) {
  return (type: Type<LazyLoaderHandler>) => {
    /* Retrieve the existing loaders defined against this component, if applicable. */
    const loaders: LazyLoaderHandlerIndex[] = Reflect.getMetadata(LazyLoaderMetadataKey, component) || [];

    /* Add a definition for decorated type to the tracked loaders set */
    loaders.push({ type });

    /* Update the component's loader metadata with the new value */
    Reflect.defineMetadata(LazyLoaderMetadataKey, loaders, component);
  }
}

/**
 * Structural directive that allows a component's bootstrapping process to be deferred until a given block of asynchronous
 * logic completes.
 */
@Directive({
  selector: '[appLazyLoader]'
})
export class LazyLoaderDirective<T> implements OnInit, OnDestroy {
  @Input('appLazyLoader')
  public set component(component: Type<T>) {
    this._component = component;
  }

  public get component() {
    return this._component;
  }

  private _component: Type<T>;

  private sub: Subscription;

  constructor(
    private readonly viewContainerRef: ViewContainerRef,
    private readonly injector: Injector,
    private readonly templateRef: TemplateRef<any>,
  ) {
  }

  ngOnInit(): void {
    /* Resolve the loaders specified for the supplied component. */
    const loaderIndices: LazyLoaderHandlerIndex[] = Reflect.getMetadata(LazyLoaderMetadataKey, this.component);

    /* Execute each supplied loader. */
    const ops$ = loaderIndices && loaderIndices.length ? loaderIndices.map(loaderIndex => {
      /* If a given loader has not yet been injected, inject it now. */
      if (!loaderIndex.instance) {
        loaderIndex.instance = this.injector.get(loaderIndex.type);
      }

      /* Run the loader's method */
      return loaderIndex.instance.load();
    }) : [of(true)];

    /* Wait until all loaders have emitted a true value */
    this.sub = combineLatest(ops$)
      .pipe(
        /* Content can only be loaded when all load operations emit true values. */
        filter(loaderResults => loaderResults.every(loaderResult => loaderResult)),

        /* Once the load ops have all emitted true values,  */
        take(1),

      ).subscribe(() => {
        /* Once we have achieved a positive result, we can load the attached template. */
        this.viewContainerRef.createEmbeddedView(this.templateRef);
      });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

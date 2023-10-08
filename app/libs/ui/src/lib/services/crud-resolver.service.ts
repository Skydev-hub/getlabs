import { Injectable, Injector, Type } from '@angular/core';
import { CrudService } from '@app/ui';
import { Reflect } from 'core-js';

const CrudEntityServiceMetadataKey = 'CrudEntityServiceMetadataKey';

/**
 * Marks a given service as a standard CrudService bound to the supplied entity type.  This allows us to dynamically
 * resolve crud services based off of a given entity type.
 */
export function CrudServiceClass<T extends object>(entityType: Type<T>) {
  return (implClass: Type<CrudService<T>>) => {
    /* Register the supplied class as the service for the set entity */
    Reflect.defineMetadata(CrudEntityServiceMetadataKey, implClass, entityType);
  }
}

/**
 * Interface for dynamically resolving the standard CrudService bound to given entity types.
 */
@Injectable({
  providedIn: 'root'
})
export class CrudResolverService {
  constructor(private readonly injector: Injector) {}

  getService<T extends object = object>(entityType: Type<T>): CrudService<T> {
    /* Attempt to retrieve the injection token for the supplied entity type. */
    const crudService = Reflect.getMetadata(CrudEntityServiceMetadataKey, entityType) as Type<CrudService<T>>;

    /* If no metadata was retrieved, throw an exception. */
    if (!crudService) {
      throw new Error(`Cannot retrieve crud service for the supplied entity type - no corresponding crud service has ` +
        `been registered!`);
    }

    return this.injector.get(crudService);
  }
}

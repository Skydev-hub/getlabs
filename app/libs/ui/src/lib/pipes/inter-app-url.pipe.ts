import { Pipe, PipeTransform } from '@angular/core';
import { ConfigurationService } from '../services';


@Pipe({
  name: 'interAppUrl'
})
export class InterAppUrlPipe implements PipeTransform {

  constructor(private readonly config: ConfigurationService) {}

  transform(path: string, subdomain?: string | undefined): string|null {
    if (!path) {
      return null;
    }

    return this.config.determineURL(path, subdomain)
  }

}

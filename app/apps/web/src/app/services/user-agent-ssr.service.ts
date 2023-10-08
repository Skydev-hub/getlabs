import { UserAgentService } from '@app/ui';
import { Inject, Injectable } from '@angular/core';

@Injectable()
export class UserAgentSsrService extends UserAgentService {
  constructor(@Inject('REQUEST') private readonly request) {
    super();
  }

  public getUserAgent(): string {
    return this.request.headers['user-agent'];
  }
}

import { Component } from '@angular/core';
import { ConfigurationService } from '../../../services/configuration.service';
import { AbstractSocialShareComponent } from '../abstract-social-share.component';

@Component({
  selector: 'app-twitter-share',
  templateUrl: './twitter-share.component.html'
})
export class TwitterShareComponent extends AbstractSocialShareComponent {
  constructor(configService: ConfigurationService) {
    super(configService);
  }
}

import { Component } from '@angular/core';
import { ConfigurationService } from '../../../services/configuration.service';
import { AbstractSocialShareComponent } from '../abstract-social-share.component';

@Component({
  selector: 'app-facebook-share',
  templateUrl: './facebook-share.component.html'
})
export class FacebookShareComponent extends AbstractSocialShareComponent {
  constructor(configService: ConfigurationService) {
    super(configService);
  }
}

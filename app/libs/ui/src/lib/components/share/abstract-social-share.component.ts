import {Input, OnInit, Directive} from '@angular/core';
import { ConfigurationService } from '../../services/configuration.service';

@Directive()
export abstract class AbstractSocialShareComponent implements OnInit {
  constructor(protected readonly configService: ConfigurationService) {}

  @Input()
  refLink: string;

  @Input()
  quote: string;

  ngOnInit(): void {
    this.refLink = this.refLink || this.configService.determineURL();
  }
}

import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AbTestNotFoundError, AbTestsService } from '../services/ab-tests.service';
import { UserAgentService } from '../services/user-agent.service';
import { environment } from '@app/shared/environments';

/**
 * Example usage:
 * <ng-container *appAbTest="'ButtonTest';version:'Green';default:true"></ng-container>
 * <ng-container *appAbTest="'ButtonTest';version:'Blue'"></ng-container>
 *
 * Make sure every test has one and only one version with default:true, as this is what is displayed to crawlers and
 * when the test service cannot find the specified test.
 */
@Directive({
  selector: '[appAbTest]'
})
export class AbTestDirective implements OnInit {
  @Input('appAbTest')
  testName: string;

  private _version: string;

  @Input()
  set appAbTestVersion(val: string) {
    this._version = val;
  }

  // if set to true then it will render if no test is found, or if request is from a crawler
  private _default: boolean = false;

  @Input()
  set appAbTestDefault(val: boolean) {
    this._default = val;
  }

  constructor(
    private service: AbTestsService,
    private container: ViewContainerRef,
    private template: TemplateRef<any>,
    private readonly userAgent: UserAgentService
  ) {}

  ngOnInit() {
    let shouldRender = false;
    if(environment.enableABTesting && !this.userAgent.isCrawler()) {
      try {
        shouldRender = this.service.shouldRender(this.testName, this._version);
      } catch (e) {
        // if no test with that name exists AbTestNotFoundError is thrown, only render if it is set to default
        if (e instanceof AbTestNotFoundError) {
          shouldRender = this._default;
        } else {
          throw e;
        }
      }
    } else if (this._default) { // if testing is disabled or is a crawler always render default
      shouldRender = true;
    }

    if (shouldRender) {
      this.container.createEmbeddedView(this.template);
    }
  }
}

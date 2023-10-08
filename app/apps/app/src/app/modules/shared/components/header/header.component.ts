import { Component, ContentChildren, Input, QueryList } from '@angular/core';
import { AuthService, AvatarType, ConfigurationService, Globals, InterAppUrlPipe, StaffUser, TemplateIdDirective } from '@app/ui';
import { FloatingNavService } from '../../services/floating-nav.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {

  @Input()
  avatarLink: string;

  @Input()
  logoHref?: string = 'getlabs-logo-dark';

  @ContentChildren(TemplateIdDirective, { descendants: true })
  templates: QueryList<TemplateIdDirective>;

  AvatarType = AvatarType;

  globals = Globals;

  constructor(
    public readonly auth: AuthService,
    public readonly floatingNav: FloatingNavService,
    private readonly config: ConfigurationService,
  ) {}

  isAdministrator(): boolean {
    return this.auth.getUser() instanceof StaffUser;
  }

  getLogoLink() {
    return this.auth.getUser() ? this.auth.getPortalUrl() : new InterAppUrlPipe(this.config).transform('/');
  }

  getTemplate(id: string) {
    const template = this.templates && this.templates.find(_template => _template.templateId === id);
    return template && template.templateRef;
  }
}

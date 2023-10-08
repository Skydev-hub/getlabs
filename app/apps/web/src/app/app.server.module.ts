import { NgModule } from '@angular/core';
import { ServerModule, ServerTransferStateModule } from '@angular/platform-server';
import { UserAgentService } from '@app/ui';
import { CookieService } from 'ngx-cookie';
import { CookieBackendModule } from 'ngx-cookie-backend';
import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { UserAgentSsrService } from './services/user-agent-ssr.service';

@NgModule({
  imports: [AppModule, ServerModule, ServerTransferStateModule, CookieBackendModule.forRoot()],
  bootstrap: [AppComponent],
  providers: [{ provide: UserAgentService, useClass: UserAgentSsrService }],
})
export class AppServerModule {}

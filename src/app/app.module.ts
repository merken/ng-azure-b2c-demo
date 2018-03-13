import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { AppComponent } from './app.component';
import { AuthenticationService } from './services/authentication.service';
import { OAuthService, OAuthModule } from 'angular-oauth2-oidc';
import { ConfigService } from './services/config.service';
import { ConfigLoader } from './app.module.config';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
    declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    OAuthModule.forRoot()
  ],
  providers: [
    OAuthService,
    ConfigService,
    AuthenticationService,
    {
      provide: APP_INITIALIZER,
      useFactory: ConfigLoader,
      multi: true,
      deps: [ConfigService]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

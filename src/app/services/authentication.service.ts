import 'rxjs/add/observable/of';

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { AuthConfig, OAuthService, JwksValidationHandler } from 'angular-oauth2-oidc';
import { ConfigService } from './config.service';


@Injectable()
export class AuthenticationService {
    private _isLoggedIn: boolean;
    private authConfig: AuthConfig;

    constructor(private oauthService: OAuthService, private configService: ConfigService) { }

    configureOAuthService() {
        if (this.configService.auth) {
            this.authConfig = {
                redirectUri: this.configService.auth.authRedirectUri,
                clientId: this.configService.auth.tenantConfig.clientID,
                scope: this.configService.auth.tenantConfig.b2cScopes[0],
                strictDiscoveryDocumentValidation: false,
                skipIssuerCheck: true,
                oidc: true
            };

            this.oauthService.configure(this.authConfig);
            this.oauthService.setStorage(localStorage);
            this.oauthService.tokenValidationHandler = new JwksValidationHandler();
            this.oauthService.setupAutomaticSilentRefresh();
        }
    }

    getToken(): string {
        return this.oauthService.getAccessToken();
    }

    get userName(): string {
        const claims = this.oauthService.getIdentityClaims() as any;
        if (claims && claims.name) {
            return claims.name;
        }

        return null;
    }

    tryLogin(state?: any): Observable<boolean | any> {
        return Observable.create(observer => {
            return this.oauthService.loadDiscoveryDocument(this.configService.auth.tenantConfig.openIdDocument).then(() => {
                return this.oauthService.tryLogin({}).then(() => {
                    observer.next(state ? state : this.isLoggedIn);
                    observer.complete();
                }).catch(err => {
                    observer.error(err);
                    observer.complete();
                });
            });
        });
    }

    initiateAuthenticationFlow(state?: any) {
        this.oauthService.loadDiscoveryDocument(this.configService.auth.tenantConfig.openIdDocument).then(() => {
            this.oauthService.initImplicitFlow();
        });
    }

    handleTokenError(route: string): Observable<string> {
        // Todo handle error
        return this.tryLogin(route);
    }

    logout(): Observable<boolean> {
        this._isLoggedIn = false;
        return Observable.create(observer => {
            this.oauthService.loadDiscoveryDocument(this.configService.auth.tenantConfig.openIdDocument).then(() => {
                this.oauthService.postLogoutRedirectUri =
                    this.configService.getLogoutRedirectUri();
                this.oauthService.logOut();
                observer.next(!this.isLoggedIn);
                observer.complete();
            });
        });
    }

    public get isLoggedIn(): boolean {
        const hasIdToken = this.oauthService.hasValidIdToken();
        const hasAccessToken = this.oauthService.hasValidAccessToken();

        return (hasIdToken && hasAccessToken);
    }

}

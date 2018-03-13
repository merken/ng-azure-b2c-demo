import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable()
export class ConfigService {
    private configured = false;
    private configuration: any;

    constructor(private injector: Injector) { }

    public get isLoaded(): boolean {
        return this.configuration !== null;
    }

    public get isConfigured(): boolean {
        return this.configured;
    }

    public get auth() {
        if (!this.configuration) {
            return null;
        }

        return this.configuration.auth;
    }

    public getLogoutRedirectUri(): string {
        return window.location.origin;
    }

    public loadEnvironmentConfig(): Promise<boolean> {
        return Observable.create(observer => {
            const http = this.injector.get(HttpClient);
            http.get('./environment.json').pipe(
                catchError((error: any): any => {
                    observer.next(false);
                    observer.complete();
                })).subscribe((env: any) => {
                    this.setupConfig(env);
                    observer.next(true);
                    observer.complete();
                });
        }).toPromise();
    }

    private setupConfig(config: any): void {
        const initialConfiguration = {};

        this.configuration = initialConfiguration;

        this.configuration = this.addAuthenticationToConfig(this.configuration, config);

        this.configuration = this.addAuthRedirectUriToConfig(this.configuration);

        this.configuration = this.addOpenIdDocumentToConfig(this.configuration);

        this.configured = true;
    }

    private getLoginRedirectUri(): string {
        return window.location.origin + '/';
    }

    private addAuthenticationToConfig(configuration: any, env: any): any {
        if (env.auth) {
            configuration = {
                ...configuration,
                auth: {
                    ...env.auth
                }
            };
        }

        return configuration;
    }

    private addAuthRedirectUriToConfig(configuration: any): any {
        if (configuration.auth) {
            configuration = {
                ...configuration,
                auth: {
                    ...configuration.auth,
                    authRedirectUri: this.getLoginRedirectUri()
                }
            };
        }

        return configuration;
    }

    private addOpenIdDocumentToConfig(configuration: any): any {
        if (configuration.auth) {
            configuration.auth.tenantConfig.openIdDocument =
                `https://login.microsoftonline.com/${configuration.auth.tenantConfig.tenant}` +
                `/v2.0/.well-known/openid-configuration?p=${configuration.auth.tenantConfig.signInPolicy}`;
        }

        return configuration;
    }
}

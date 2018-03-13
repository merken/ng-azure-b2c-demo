import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { ConfigService } from './services/config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'NG-AZURE-B2C-DEMO';
  isLoggedIn = false;
  userName = '';

  constructor(private configService: ConfigService, private authenticationService: AuthenticationService) { }

  ngOnInit(): void {
    if (this.configService.isLoaded) {
      this.authenticationService.configureOAuthService();
      this.authenticationService.tryLogin().subscribe(isLoggedIn => {
        this.isLoggedIn = isLoggedIn;

        if(isLoggedIn){
          this.userName = this.authenticationService.userName;
        }
      });
    }
  }

  login() {
    this.authenticationService.initiateAuthenticationFlow();
  }

  logout() {
    this.authenticationService.logout().subscribe();
  }
}

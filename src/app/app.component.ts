import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { AuthService } from './auth/auth.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { SharedModule } from './shared.module';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent,
    MatSidenavModule,
    SharedModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  private authListenerSubs!: Subscription;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.authService.autoAuthUser();
    this.authListenerSubs = this.authService.getAuthStatusListener().subscribe(isAuthenticated => {
      this.userIsAuthenticated = isAuthenticated && this.authService.hasRole('admin');
      const roles = this.authService.getUserRoles();
    });
  }

  ngOnDestroy(): void {
    this.authListenerSubs.unsubscribe();
  }
}

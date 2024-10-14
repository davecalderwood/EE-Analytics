import { AppComponent } from './app/app.component';
import { AuthGuard } from './app/auth/auth.guard';
import { AuthInterceptor } from './app/auth/auth-interceptor';
import { bootstrapApplication } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { LoginComponent } from './app/auth/login/login.component';
import { PostCreateComponent } from './app/posts/post-create/post-create.component';
import { PostListComponent } from './app/posts/post-list/post-list.component';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { SignupComponent } from './app/auth/signup/signup.component';
import { ErorInterceptor } from './app/error/error-interceptor';
import { AnalyticsCreateComponent } from './app/auth/analytics/analytics-create/analytics-create.component';
import { AnalyticsDisplayComponent } from './app/auth/analytics/analytics-display/analytics-display.component';

const routes = [
  { path: '', component: PostListComponent },
  { path: 'create', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'edit/:postId', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  // Analytics
  { path: 'analytics', component: AnalyticsDisplayComponent },
  { path: 'createAnalytics', component: AnalyticsCreateComponent, canActivate: [AuthGuard] },
  { path: 'edit/:analyticsId', component: AnalyticsCreateComponent, canActivate: [AuthGuard] },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErorInterceptor,
      multi: true
    },
    provideAnimations(),
    AuthGuard
  ]
}).catch(err => console.error(err));
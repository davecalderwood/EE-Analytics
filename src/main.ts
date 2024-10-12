import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { PostCreateComponent } from './app/posts/post-create/post-create.component';
import { PostListComponent } from './app/posts/post-list/post-list.component';
import { provideAnimations } from '@angular/platform-browser/animations';

// Define routes
const routes = [
  { path: '', component: PostListComponent },
  { path: 'create', component: PostCreateComponent },
  { path: 'edit/:postId', component: PostCreateComponent },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideAnimations(),
  ]
}).catch(err => console.error(err));
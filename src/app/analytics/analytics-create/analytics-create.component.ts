import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AnalyticsService } from '../analytics.service';
import { SharedModule } from '../../shared.module';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-analytics-create',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './analytics-create.component.html',
  styleUrl: './analytics-create.component.css'
})
export class AnalyticsCreateComponent implements OnInit, OnDestroy {
  enteredContent = '';
  private mode = 'create';
  private analyticsId: any;
  analytics: any;
  isLoading = false;
  form!: FormGroup;
  private authStatusSub!: Subscription;

  constructor(
    public analyticsService: AnalyticsService,
    public route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(
        authStatus => {
          this.isLoading = false;
        }
      );
    this.form = new FormGroup({
      'content': new FormControl(null, { validators: [Validators.required] }),
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        this.mode = 'edit';
        this.analyticsId = paramMap.get('postId');
        this.isLoading = true;
        this.analyticsService.getAnalytics(this.analyticsId).subscribe((analyticsData: any) => {
          this.analytics = {
            id: analyticsData._id,
            content: analyticsData.content,
            creator: analyticsData.creator
          }
          this.form.setValue({
            'content': this.analytics.content,
          })
          this.isLoading = false;
        })
      } else {
        this.mode = 'create';
        this.analyticsId = null;
        this.analytics = { content: '' };
      }
    });
  }

  onSaveAnalytics() {
    if (this.form.invalid) return;

    this.isLoading = true;
    if (this.mode === 'create') {
      this.analyticsService.addAnalytics(
        this.form.value.content
      );
    } else {
      this.analyticsService.updateAnalytics(
        this.analyticsId,
        this.form.value.content
      )
    }
    this.form.reset();
  }

  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}

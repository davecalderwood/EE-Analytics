import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../analytics.service';
import { AnalyticsData } from '../analytics.model';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-analytics-display',
  standalone: true,
  imports: [],
  templateUrl: './analytics-display.component.html',
  styleUrl: './analytics-display.component.css'
})
export class AnalyticsDisplayComponent implements OnInit, OnDestroy {
  analytics: AnalyticsData[] = [];
  private analyticsSub!: Subscription;
  isLoading = false;
  private authStatusSubs!: Subscription;
  userIsAuthenticated = false;
  userId!: string;

  constructor(public analyticsService: AnalyticsService, private authService: AuthService) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.analyticsService.getAnalyticsData();
    this.userId = this.authService.getUserId();
    this.analyticsSub = this.analyticsService.getAnalyticsUpdateListener()
      .subscribe(({ analyticsData }: { analyticsData: AnalyticsData[]; dataCount: number }) => {
        this.analytics = analyticsData;
        this.isLoading = false;
      });
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSubs = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  onDelete(postId: string) {
    this.isLoading = true;
    this.analyticsService.deleteAnalytics(postId)
      .subscribe({
        next: () => {
          this.analyticsService.getAnalyticsData();
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.analyticsSub.unsubscribe();
    this.authStatusSubs.unsubscribe();
  }
}

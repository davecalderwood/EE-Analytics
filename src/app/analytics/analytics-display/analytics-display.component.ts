import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../analytics.service';
import { AnalyticsData } from '../analytics.model';
import { AuthService } from '../../auth/auth.service';
import { Character } from '../../characters/character.model';
import { CharacterService } from '../../characters/character.service';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-analytics-display',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './analytics-display.component.html',
  styleUrl: './analytics-display.component.css'
})
export class AnalyticsDisplayComponent implements OnInit, OnDestroy {
  analytics: AnalyticsData[] = [];
  characters: Character[] = [];
  private analyticsSub!: Subscription;
  private characterSub!: Subscription;
  isLoading = false;
  private authStatusSubs!: Subscription;
  userIsAuthenticated = false;
  userId!: string;

  constructor(
    public analyticsService: AnalyticsService,
    public characterService: CharacterService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    // Services
    this.userId = this.authService.getUserId();
    this.analyticsService.getAnalyticsData();
    this.characterService.getCharacters();

    // Analytics
    this.analyticsSub = this.analyticsService.getAnalyticsUpdateListener()
      .subscribe(({ analyticsData }: { analyticsData: AnalyticsData[]; dataCount: number }) => {
        this.analytics = analyticsData;
      });

    // Characters
    this.characterSub = this.characterService.getCharacterUpdateListener()
      .subscribe(({ characters, characterCount }: { characters: Character[]; characterCount: number }) => {
        this.characters = characters;
        this.isLoading = false;
      });

    // Authentication
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
    this.characterSub.unsubscribe();
    this.authStatusSubs.unsubscribe();
  }
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../analytics.service';
import { AnalyticsData } from '../analytics.model';
import { AuthService } from '../../auth/auth.service';
import { Character } from '../../characters/character.model';
import { CharacterService } from '../../characters/character.service';
import { SharedModule } from '../../shared.module';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { GraphComponent } from '../../shared/graph/graph.component';

@Component({
  selector: 'app-analytics-display',
  standalone: true,
  imports: [
    SharedModule,
    BaseChartDirective,
    GraphComponent
  ],
  templateUrl: './analytics-display.component.html',
  styleUrls: ['./analytics-display.component.css'],
})
export class AnalyticsDisplayComponent implements OnInit, OnDestroy {
  analytics: AnalyticsData[] = [];
  analyticsLoaded = false;
  barChartData!: ChartData<'bar'>;
  characters: Character[] = [];
  charactersLoaded = false;
  isLoading = false;
  private analyticsSub!: Subscription;
  private authStatusSubs!: Subscription;
  private characterSub!: Subscription;
  timeSurvivedChartData!: ChartData<'bar'>;
  userId!: string;
  userIsAuthenticated = false;

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
        console.log(analyticsData)
        this.analytics = analyticsData;
        this.analyticsLoaded = true;
        this.tryUpdateCharts();
      });

    // Characters
    this.characterSub = this.characterService.getCharacterUpdateListener()
      .subscribe(({ characters, characterCount }: { characters: Character[]; characterCount: number }) => {
        this.characters = characters;
        this.charactersLoaded = true;
        this.isLoading = false;
        this.tryUpdateCharts();
      });

    // Authentication
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSubs = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  private tryUpdateCharts() {
    if (this.analyticsLoaded && this.charactersLoaded) {
      this.characterPlayCountData();
      this.characterTimeSurvivedData();
    }
  }

  private characterPlayCountData() {
    const dataCounts: { [key: string]: number } = {};

    this.analytics.forEach((analyticsData) => {
      analyticsData.charactersUsed.forEach((character) => {
        const matchedCharacter = this.characters.find(c => c.characterGUID === character.characterGUID);
        if (matchedCharacter && matchedCharacter.primaryWeapon) {
          dataCounts[matchedCharacter.characterGUID] = (dataCounts[matchedCharacter.characterGUID] || 0) + 1;
        }
      });
    });

    this.barChartData = {
      labels: this.characters
        .filter(character => character.primaryWeapon)
        .map(character => character.characterName),
      datasets: [{
        label: 'Character Play Count',
        data: this.characters
          .filter(character => character.primaryWeapon)
          .map(character => dataCounts[character.characterGUID] || 0),
        backgroundColor: this.characters
          .filter(character => character.primaryWeapon)
          .map(character => `#${character.color}`),
      }]
    };
  }

  private characterTimeSurvivedData() {
    const timeSurvivedCounts: { [key: string]: number } = {};
    const usageCounts: { [key: string]: number } = {};

    // Calculate total time survived and usage counts for each character
    this.analytics.forEach((analyticsData) => {
      analyticsData.charactersUsed.forEach((character) => {
        const matchedCharacter = this.characters.find(c => c.characterGUID === character.characterGUID);
        if (matchedCharacter && matchedCharacter.primaryWeapon) {
          // Sum the time survived
          timeSurvivedCounts[matchedCharacter.characterGUID] =
            (timeSurvivedCounts[matchedCharacter.characterGUID] || 0) + analyticsData.timeSurvived;

          // Count the number of times each character was used
          usageCounts[matchedCharacter.characterGUID] =
            (usageCounts[matchedCharacter.characterGUID] || 0) + 1;
        }
      });
    });

    // Prepare the chart data
    this.timeSurvivedChartData = {
      labels: this.characters
        .filter(character => character.primaryWeapon)
        .map(character => character.characterName),
      datasets: [{
        label: 'Average Survival Time (Minutes)',  // Updated label
        data: this.characters
          .filter(character => character.primaryWeapon)
          .map(character => {
            const totalSurvived = timeSurvivedCounts[character.characterGUID] || 0;
            const usageCount = usageCounts[character.characterGUID] || 1; // Prevent division by zero
            return (totalSurvived / usageCount) / 60; // Convert seconds to minutes
          }),
        backgroundColor: this.characters
          .filter(character => character.primaryWeapon)
          .map(character => `#${character.color}`),
      }]
    };
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

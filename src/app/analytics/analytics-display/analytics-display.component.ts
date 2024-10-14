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
  characters: Character[] = [];
  private analyticsSub!: Subscription;
  private characterSub!: Subscription;
  isLoading = false;
  private authStatusSubs!: Subscription;
  userIsAuthenticated = false;
  userId!: string;
  barChartData!: ChartData<'bar'>;

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
        console.log(analyticsData);
        this.analytics = analyticsData;
        this.updateChartData(); // Call to update chart data
      });

    // Characters
    this.characterSub = this.characterService.getCharacterUpdateListener()
      .subscribe(({ characters, characterCount }: { characters: Character[]; characterCount: number }) => {
        this.characters = characters;
        this.isLoading = false;
        this.updateChartData(); // Call to update chart data
      });

    // Authentication
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.authStatusSubs = this.authService.getAuthStatusListener()
      .subscribe(isAuthenticated => {
        this.userIsAuthenticated = isAuthenticated;
        this.userId = this.authService.getUserId();
      });
  }

  private updateChartData() {
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

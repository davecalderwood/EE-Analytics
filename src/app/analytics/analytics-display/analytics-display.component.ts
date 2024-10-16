import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AnalyticsService } from '../analytics.service';
import { AnalyticsData, CharacterUsed } from '../analytics.model';
import { AuthService } from '../../auth/auth.service';
import { Character } from '../../characters/character.model';
import { CharacterService } from '../../characters/character.service';
import { SharedModule } from '../../shared.module';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData } from 'chart.js';
import { GraphComponent } from '../../shared/graph/graph.component';
import { CharacterKPI } from '../../interfaces';
import { EquipmentService } from '../../equipment/equipment.service';
import { Equipment } from '../../equipment/equipment.model';

@Component({
  selector: 'app-analytics-display',
  standalone: true,
  imports: [
    SharedModule,
    BaseChartDirective,
    GraphComponent
  ],
  templateUrl: './analytics-display.component.html',
  styleUrls: ['./analytics-display.component.scss'],
})
export class AnalyticsDisplayComponent implements OnInit, OnDestroy {
  // Data properties
  analytics: AnalyticsData[] = [];
  characters: Character[] = [];
  equipment: Equipment[] = [];

  // Loading states
  analyticsLoaded = false;
  charactersLoaded = false;
  equipmentLoaded = false;
  isLoading = false;

  // Chart data properties
  timeSurvivedChartData!: ChartData<'bar'>;
  heatMapChartData: any;

  // User authentication properties
  userId!: string;
  userIsAuthenticated = false;

  // KPI data
  averagePlayPercentages: CharacterKPI[] = [];

  // Subscription properties
  private analyticsSub!: Subscription;
  private authStatusSubs!: Subscription;
  private characterSub!: Subscription;
  private equipmentSub!: Subscription;

  constructor(
    public analyticsService: AnalyticsService,
    public characterService: CharacterService,
    public equipmentService: EquipmentService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    // Services
    this.userId = this.authService.getUserId();
    this.analyticsService.getAnalyticsData();
    this.characterService.getCharacters();
    this.equipmentService.getAllEquipment();

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

    // Equipment
    this.equipmentSub = this.equipmentService.getEquipmentUpdateListener()
      .subscribe(({ equipment, equipmentCount }: { equipment: Equipment[]; equipmentCount: number }) => {
        this.equipment = equipment;
        this.equipmentLoaded = true;
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
    if (this.analyticsLoaded && this.charactersLoaded && this.equipmentLoaded) {
      this.characterTimeSurvivedData();
      this.averagePlayPercentages = this.calculateAveragePlayPercentage();
      this.heatMapChartData = this.prepareHeatMapChartData();
    }
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

    // Prepare the chart data for a bar chart
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
          .map(character => `#${character.color}`), // Set character color for the bars
        borderColor: this.characters
          .filter(character => character.primaryWeapon)
          .map(character => `#${character.color}`), // Solid border color for each bar
        borderWidth: 1 // Width of the bar borders
      }]
    };
  }

  private calculateAveragePlayPercentage(): CharacterKPI[] {
    const playCounts: { [key: string]: number } = {};

    // Calculate total play counts for each character
    this.analytics.forEach((analyticsData) => {
      analyticsData.charactersUsed.forEach((character) => {
        const matchedCharacter = this.characters.find(c => c.characterGUID === character.characterGUID);
        if (matchedCharacter && matchedCharacter.primaryWeapon) {
          playCounts[matchedCharacter.characterGUID] =
            (playCounts[matchedCharacter.characterGUID] || 0) + 1;
        }
      });
    });

    // Calculate total plays across all primary characters
    const totalPlays = Object.values(playCounts).reduce((sum, count) => sum + count, 0);

    // Prepare the average play percentage data
    return this.characters
      .filter(character => character.primaryWeapon)
      .map(character => {
        const totalPlaysForCharacter = playCounts[character.characterGUID] || 0;
        const averagePlayPercentage = totalPlays > 0 ? (totalPlaysForCharacter / totalPlays) * 100 : 0;

        return {
          characterName: character.characterName,
          averagePlayPercentage: averagePlayPercentage,
          characterColor: character.color,
        };
      });
  }

  private generateHeatMapData() {
    const heatMapData: { [equipmentName: string]: { successfulExtractions: number; usageCount: number } } = {};

    this.analytics.forEach((analyticsData) => {
      analyticsData.charactersUsed.forEach((character: CharacterUsed) => {
        const equipmentUsed = character.equipment?.map(e => e.equipmentName) || [];

        // Accumulate data for each piece of equipment used
        equipmentUsed.forEach(equipmentName => {
          if (!heatMapData[equipmentName]) {
            heatMapData[equipmentName] = { successfulExtractions: 0, usageCount: 0 };
          }

          // Update successful extractions and usage count
          heatMapData[equipmentName]['successfulExtractions'] += analyticsData.successfullyExtracted ? 1 : 0;
          heatMapData[equipmentName]['usageCount']++;
        });
      });
    });

    return heatMapData;
  }

  private prepareHeatMapChartData() {
    const heatMapData = this.generateHeatMapData();

    const labelsX: string[] = []; // Equipment Names
    const labelsY: string[] = ['Successful Extractions'];
    const datasets: number[][] = [];

    Object.keys(heatMapData).forEach((equipmentName) => {
      const data = heatMapData[equipmentName];
      labelsX.push(equipmentName);
      datasets.push([
        data['successfulExtractions'] // Total successful extractions
      ]);
    });

    // Map the data into a format for a heatmap plugin
    return {
      labels: {
        x: labelsX,
        y: labelsY
      },
      datasets: [{
        data: datasets,
        backgroundColor: (context: any) => {
          const value = context.dataset.data[context.dataIndex][0]; // Get the successful extractions count
          const alpha = Math.min(1, Math.max(0, value / 100)); // Adjust alpha based on value
          return `rgba(255, 99, 132, ${alpha})`;
        }
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
    this.equipmentSub.unsubscribe();
    this.authStatusSubs.unsubscribe();
  }
}

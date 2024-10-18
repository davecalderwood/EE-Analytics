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
import { CharacterKPI, CustomScatterChartData } from '../../interfaces';
import { EquipmentService } from '../../equipment/equipment.service';
import { Equipment } from '../../equipment/equipment.model';
import { isPrimaryWeapon } from '../../shared/helperFunctions';

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
  scatterPlotChartData!: ChartData<'scatter'>;

  // User authentication properties
  userId!: string;
  userIsAuthenticated = false;

  // KPI data
  averagePlayPercentages: CharacterKPI[] = [];
  bestTeamCombo: any;
  worstTeamCombo: any;

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
      this.scatterPlotChartData = this.prepareScatterPlotChartData();

      // Calculate best and worst team combos
      const { bestTeam, bestTeamScore, worstTeam, worstTeamScore } = this.determineBestAndWorstTeams();
      this.bestTeamCombo = {
        characters: bestTeam,
        score: bestTeamScore,
        teamColor: '28A745' // Customize color as needed
      };
      this.worstTeamCombo = {
        characters: worstTeam,
        score: worstTeamScore,
        teamColor: 'DC3545' // Customize color as needed
      };
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
      })
      .sort((a, b) => b.averagePlayPercentage - a.averagePlayPercentage);
  }

  private prepareScatterPlotChartData(): CustomScatterChartData {
    const scatterData = this.generateScatterData();
    const datasets = Object.keys(scatterData).map((equipmentName) => {
      const point = scatterData[equipmentName]; // Access the single object for this equipment

      return {
        x: point.successfulExtractions,  // Successful extractions on the x-axis
        y: point.usageCount,              // Usage count on the y-axis
        equipmentName: equipmentName,     // To label points in tooltips
        imagePath: point.imagePath         // Include the image path
      };
    });

    // Check if datasets is empty
    if (datasets.length === 0) {
      console.log('No datasets available for the scatter plot');
    }

    return {
      datasets: [{
        label: 'Equipment Usage',
        data: datasets,
        showLine: false, // Ensure it's set to false for a scatter plot
      }],
      axisLabels: {
        x: 'Equipment Success',
        y: 'Equipment Usage'
      }
    };
  }

  private generateScatterData() {
    const scatterData: {
      [equipmentName: string]: {
        successfulExtractions: number;
        usageCount: number;
        imagePath: string;
      }
    } = {};

    // Iterate through each analytics data
    this.analytics.forEach((analyticsData) => {
      analyticsData.equipmentUsed.forEach((equipment: Equipment) => {
        const equipmentName = equipment.equipmentName;

        if (!scatterData[equipmentName]) {
          scatterData[equipmentName] = {
            successfulExtractions: 0,
            usageCount: 0,
            imagePath: equipment.imagePath
          };
        }

        // Update successful extractions and usage count
        scatterData[equipmentName]['successfulExtractions'] += analyticsData.successfullyExtracted ? 1 : 0;
        scatterData[equipmentName]['usageCount']++;
      });
    });

    return scatterData;
  }

  private determineBestAndWorstTeams() {
    const teamData = this.generateTeamComboData();

    let bestTeam: string[] = [];
    let worstTeam: string[] = [];
    let highestScore = -Infinity;
    let lowestScore = Infinity;

    Object.keys(teamData).forEach((teamCombo) => {
      const { totalScore, occurrences } = teamData[teamCombo];
      const averageScore = totalScore / occurrences;

      // Check for best team
      if (averageScore > highestScore) {
        highestScore = averageScore;
        bestTeam = teamCombo.split(', '); // Assuming teamCombo is a string of names separated by commas
      }

      // Check for worst team
      if (averageScore < lowestScore) {
        lowestScore = averageScore;
        worstTeam = teamCombo.split(', '); // Same splitting here
      }
    });

    return {
      bestTeam,
      bestTeamScore: highestScore,
      worstTeam,
      worstTeamScore: lowestScore,
    };
  }

  // Helper method to extract primary weapons
  private extractPrimaryWeapons(charactersUsed: CharacterUsed[]): string {
    if (!this.characters) {
      return ''; // Return empty if character data isn't loaded yet
    }

    return charactersUsed
      .filter(characterUsed => {
        const matchingCharacter = this.characters.find(
          char => char.characterGUID === characterUsed.characterGUID // Compare using GUID
        );

        // Check if this character is identified as a primary weapon in the service data
        return matchingCharacter && matchingCharacter.primaryWeapon;
      })
      .map(character => character.characterName) // Return names of primary weapon characters
      .join(', ');
  }

  private generateTeamComboData(): { [teamCombo: string]: { totalScore: number; occurrences: number } } {
    const teamData: { [teamCombo: string]: { totalScore: number; occurrences: number } } = {};

    this.analytics.forEach((analyticsData, index) => {
      // Extract characters used based on the characters listed as primary weapons
      const primaryWeaponCharacters = analyticsData.charactersUsed
        .filter(characterUsed => isPrimaryWeapon(characterUsed.characterGUID, this.characters))
        .map(character => character.characterName);

      // Create a unique key for the team
      const teamCombo = primaryWeaponCharacters.join(', ');

      // Calculate the score based on survival and extraction
      const score = this.calculateTeamScore(analyticsData.successfullyExtracted, analyticsData.timeSurvived);

      if (!teamData[teamCombo]) {
        teamData[teamCombo] = { totalScore: 0, occurrences: 0 };
      }

      teamData[teamCombo].totalScore += score;
      teamData[teamCombo].occurrences++;
    });

    return teamData;
  }

  private calculateTeamScore(successfulExtractions: boolean, survivalTime: number): number {
    const baseScore = survivalTime; // Base the score on survival time
    const extractionBonus = successfulExtractions ? 100 : 0; // Add a fixed bonus for successful extraction
    return baseScore + extractionBonus; // Combine both to get the final score
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

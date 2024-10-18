import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { AnalyticsData, CharacterUsed, WeaponUpgrade } from "./analytics.model";
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import { environment } from "../../environment/environment"
import { Equipment } from "../equipment/equipment.model";
const BACKEND_URL = environment.apiURL + '/analytics/';

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
    private analyticsData: AnalyticsData[] = [];
    private analyticsUpdated = new Subject<{ analyticsData: AnalyticsData[], dataCount: number }>();

    constructor(private http: HttpClient, private router: Router) { }

    // Method to fetch analytics data with pagination
    getAnalyticsData(dateRange: string) {
        const queryParams = `?dateRange=${dateRange}`;
        this.http.get<{ message: string, analytics: any, maxData: number }>(BACKEND_URL + queryParams)
            .pipe(map((analyticsData) => {
                return {
                    analyticsData: analyticsData.analytics.map((data: any) => {
                        return {
                            charactersUsed: data.charactersUsed.map((character: any) => ({
                                characterName: character.characterName,
                                characterGUID: character.characterGUID,
                                weaponUpgrades: character.weaponUpgrades.map((upgrade: any) => ({
                                    upgradeTreeName: upgrade.upgradeTreeName,
                                    upgradeTreeLevel: upgrade.upgradeTreeLevel
                                })) as WeaponUpgrade[]
                            })) as CharacterUsed[],
                            worldName: data.worldName,
                            timeSurvived: data.timeSurvived,
                            successfullyExtracted: data.successfullyExtracted,
                            scrapCount: data.scrapCount,
                            levelReached: data.levelReached,
                            equipmentUsed: data.equipmentUsed.map((equipment: any) => ({
                                equipmentName: equipment.moduleName,
                                equipmentGUID: equipment.moduleGUID,
                                imagePath: equipment.image
                            })) as Equipment[],
                            leader: data.leader
                        } as AnalyticsData;
                    }),
                    maxData: analyticsData.maxData
                };
            }))
            .subscribe((transformedAnalyticsData) => {
                this.analyticsData = transformedAnalyticsData.analyticsData;
                this.analyticsUpdated.next({
                    analyticsData: [...this.analyticsData],
                    dataCount: transformedAnalyticsData.maxData
                });
            });
    }

    // Listener to get the analytics data updates
    getAnalyticsUpdateListener() {
        return this.analyticsUpdated.asObservable();
    }

    // Fetch a single analytics entry by ID
    getAnalytics(id: string) {
        return this.http.get<AnalyticsData>(BACKEND_URL + id);
    }

    // Add new analytics entry
    addAnalytics(analyticsData: AnalyticsData) {
        console.log(analyticsData)
        this.http.post<{ message: string, analytics: AnalyticsData }>(BACKEND_URL, analyticsData, {
            headers: { 'Content-Type': 'application/json' }
        })
            .subscribe(() => {
                this.router.navigate(['/analytics']);
            });
    }

    // Update an existing analytics entry
    updateAnalytics(id: string, analyticsData: AnalyticsData) {
        this.http
            .put(BACKEND_URL + id, analyticsData)
            .subscribe(() => {
                this.router.navigate(['/analytics']);
            });
    }

    // Delete an analytics entry by ID
    deleteAnalytics(analyticsId: string) {
        return this.http.delete<{ message: string }>(BACKEND_URL + analyticsId);
    }
}
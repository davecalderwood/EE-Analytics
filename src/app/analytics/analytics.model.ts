import { Equipment } from "../equipment/equipment.model";

export interface WeaponUpgrade {
    upgradeTreeName: string;
    upgradeTreeLevel: number;
}

export interface CharacterUsed {
    characterName: string;
    characterGUID: string;
    weaponUpgrades: WeaponUpgrade[];
    equipment?: Equipment[];
}

export interface AnalyticsData {
    id: any;
    charactersUsed: CharacterUsed[];
    worldName: string;
    timeSurvived: number;
    successfullyExtracted: boolean;
    scrapCount: number;
    levelReached: number;
    equipmentUsed: any[];
}

import { Equipment } from "../equipment/equipment.model";

export interface WeaponUpgrade {
    upgradeTreeName: string;
    upgradeTreeLevel: number;
}

export interface CharacterUsed {
    characterName: string;
    characterGUID: string;
    weaponUpgrades: WeaponUpgrade[];
}

export interface AnalyticsData {
    id: any;
    charactersUsed: CharacterUsed[];
    equipmentUsed: Equipment[];
    worldName: string;
    timeSurvived: number;
    successfullyExtracted: boolean;
    scrapCount: number;
    levelReached: number;
}

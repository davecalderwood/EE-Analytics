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
    worldName: string;
    timeSurvived: number;
    successfullyExtracted: boolean;
    scrapCount: number;
    levelReached: number;
    equipmentUsed: any[];
}

import { Character } from "../characters/character.model";

export function isPrimaryWeapon(characterGUID: string, characters: Character[]): boolean {
    const character = characters.find(char => char.characterGUID === characterGUID);
    return character ? character.primaryWeapon === true : false;
}
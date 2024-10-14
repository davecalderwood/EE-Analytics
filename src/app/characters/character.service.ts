import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import { environment } from "../../environment/environment";
import { Character } from "./character.model";

const BACKEND_URL = environment.apiURL + '/characters/';

@Injectable({ providedIn: 'root' })
export class CharacterService {
    private characters: Character[] = [];
    private charactersUpdated = new Subject<{ characters: Character[]; characterCount: number }>();

    constructor(private http: HttpClient, private router: Router) { }

    // Fetch characters from the backend
    getCharacters() {
        this.http.get<{ message: string; characters: any }>(BACKEND_URL)
            .pipe(map((characterData) => {
                return {
                    characters: characterData.characters.map((character: any) => {
                        return {
                            id: character._id,
                            characterGUID: character.characterGUID,
                            characterName: character.characterName,
                            weaponName: character.weaponName,
                            primaryWeapon: character.primaryWeapon,
                            color: character.color,
                            imagePath: character.imagePath,
                            creator: character.creator
                        };
                    }),
                    characterCount: characterData.characters.length // Assuming this is how you get the count
                };
            }))
            .subscribe((transformedCharacterData) => {
                this.characters = transformedCharacterData.characters;
                this.charactersUpdated.next({
                    characters: [...this.characters],
                    characterCount: transformedCharacterData.characterCount
                });
            });
    }

    // Get an observable for character updates
    getCharacterUpdateListener() {
        return this.charactersUpdated.asObservable();
    }

    // Fetch a specific character by ID
    getCharacter(id: string) {
        return this.http.get<{
            _id: string;
            characterGUID: string;
            characterName: string;
            weaponName: string;
            primaryWeapon: boolean;
            color: string;
            imagePath: string;
            creator: any;
        }>(BACKEND_URL + id);
    }

    // Add a new character
    addCharacter(characterGUID: string, characterName: string, weaponName: string, primaryWeapon: boolean, color: string, image: File) {
        const characterData = new FormData();
        characterData.append('characterGUID', characterGUID);
        characterData.append('characterName', characterName);
        characterData.append('weaponName', weaponName);
        characterData.append('primaryWeapon', String(primaryWeapon));
        characterData.append('color', color);
        characterData.append('image', image, characterName);

        this.http.post<{ message: string; character: Character }>(BACKEND_URL, characterData)
            .subscribe(() => {
                this.router.navigate(['/']);
            });
    }

    // Update an existing character
    updateCharacter(id: string, characterGUID: string, characterName: string, weaponName: string, primaryWeapon: boolean, color: string, image: File | string) {
        let characterData: Character | FormData;
        if (typeof (image) === 'object') {
            characterData = new FormData();
            characterData.append('id', id);
            characterData.append('characterGUID', characterGUID);
            characterData.append('characterName', characterName);
            characterData.append('weaponName', weaponName);
            characterData.append('primaryWeapon', String(primaryWeapon));
            characterData.append('color', color);
            characterData.append('image', image, characterName);
        } else {
            characterData = {
                id: id,
                characterGUID: characterGUID,
                characterName: characterName,
                weaponName: weaponName,
                primaryWeapon: primaryWeapon,
                color: color,
                imagePath: image,
                creator: null // Set creator ID to null as it gets set properly on the server side
            };
        }

        this.http.put(BACKEND_URL + id, characterData)
            .subscribe(() => {
                this.router.navigate(['/']);
            });
    }

    // Delete a character by ID
    deleteCharacter(characterId: string) {
        return this.http.delete<{ message: string }>(BACKEND_URL + characterId);
    }
}

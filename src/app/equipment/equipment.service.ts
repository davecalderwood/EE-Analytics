import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { map } from 'rxjs/operators';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";

import { environment } from "../../environment/environment";
import { Equipment } from "./equipment.model";

const BACKEND_URL = environment.apiURL + '/equipment/';

@Injectable({ providedIn: 'root' })
export class EquipmentService {
    private equipment: Equipment[] = [];
    private equipmentUpdated = new Subject<{ equipment: Equipment[]; equipmentCount: number }>();

    constructor(private http: HttpClient, private router: Router) { }

    // Fetch equipment from the backend
    getCharacters() {
        this.http.get<{ message: string; equipment: any }>(BACKEND_URL)
            .pipe(map((equipmentData) => {
                return {
                    equipment: equipmentData.equipment.map((character: any) => {
                        return {
                            id: character._id,
                            equipmentGUID: character.equipmentGUID,
                            equipmentName: character.equipmentName,
                            equipmentTier: character.equipmentTier,
                            imagePath: character.imagePath,
                            creator: character.creator
                        };
                    }),
                    equipmentCount: equipmentData.equipment.length
                };
            }))
            .subscribe((transformedEquipmentData) => {
                this.equipment = transformedEquipmentData.equipment;
                this.equipmentUpdated.next({
                    equipment: [...this.equipment],
                    equipmentCount: transformedEquipmentData.equipmentCount
                });
            });
    }

    // Get an observable for character updates
    getCharacterUpdateListener() {
        return this.equipmentUpdated.asObservable();
    }

    // Fetch a specific character by ID
    getCharacter(id: string) {
        return this.http.get<{
            _id: string;
            equipmentGUID: string;
            equipmentNameName: string;
            equipmentTier: string;
            imagePath: string;
            creator: any;
        }>(BACKEND_URL + id);
    }

    // Add a new character
    addCharacter(equipmentGUID: string, equipmentName: string, equipmentTier: string, image: File) {
        const equipmentData = new FormData();
        equipmentData.append('equipmentGUID', equipmentGUID);
        equipmentData.append('equipmentName', equipmentName);
        equipmentData.append('equipmentTier', equipmentTier);
        equipmentData.append('image', image, equipmentName);

        this.http.post<{ message: string; character: Equipment }>(BACKEND_URL, equipmentData)
            .subscribe(() => {
                this.router.navigate(['/']);
            });
    }

    // Update an existing character
    updateCharacter(id: string, equipmentGUID: string, equipmentName: string, equipmentTier: string, image: File | string) {
        let equipmentData: Equipment | FormData;
        if (typeof (image) === 'object') {
            equipmentData = new FormData();
            equipmentData.append('id', id);
            equipmentData.append('equipmentGUID', equipmentGUID);
            equipmentData.append('equipmentName', equipmentName);
            equipmentData.append('equipmentTier', equipmentTier);
            equipmentData.append('image', image, equipmentName);
        } else {
            equipmentData = {
                id: id,
                equipmentGUID: equipmentGUID,
                equipmentName: equipmentName,
                equipmentTier: equipmentTier,
                imagePath: image,
                creator: null // Set creator ID to null as it gets set properly on the server side
            };
        }

        this.http.put(BACKEND_URL + id, equipmentData)
            .subscribe(() => {
                this.router.navigate(['/']);
            });
    }

    // Delete a character by ID
    deleteCharacter(characterId: string) {
        return this.http.delete<{ message: string }>(BACKEND_URL + characterId);
    }
}

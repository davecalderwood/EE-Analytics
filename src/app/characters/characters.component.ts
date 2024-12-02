import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { mimeType } from '../mime-type.validator';
import { CharacterService } from './character.service';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.css'
})
export class CharactersComponent implements OnInit, OnDestroy {
  private mode = 'create';
  private characterId!: any;
  character: any;
  isLoading = false;
  form!: FormGroup;
  imagePreview!: string;
  private authStatusSub!: Subscription;

  constructor(
    public charactersService: CharacterService,
    public route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(
        authStatus => {
          this.isLoading = false;

          if (!this.authService.hasRole('admin')) {
            this.router.navigate(['/']);  // Redirect to home if user does not have 'admin' role
          }
        }
      );
    this.form = new FormGroup({
      'characterName': new FormControl(null, { validators: [Validators.required] }),
      'weaponName': new FormControl(null, { validators: [Validators.required] }),
      'characterGUID': new FormControl(null, { validators: [Validators.required] }),
      'primaryWeapon': new FormControl(null, {}),
      'image': new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] }),
      'color': new FormControl(null, { validators: [Validators.required] }),
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('characterId')) {
        this.mode = 'edit';
        this.characterId = paramMap.get('characterId');
        this.isLoading = true;
        this.charactersService.getCharacter(this.characterId).subscribe((characterData: any) => {
          this.character = {
            id: characterData._id,
            characterName: characterData.characterName,
            weaponName: characterData.weaponName,
            characterGUID: characterData.characterGUID,
            imagePath: characterData.imagePath,
            primaryWeapon: characterData.primaryWeapon,
            color: characterData.color,
            creator: characterData.creator
          }
          this.form.setValue({
            'characterName': this.character.characterName,
            'weaponName': this.character.weaponName,
            'characterGUID': this.character.characterGUID,
            'primaryWeapon': this.character.primaryWeapon,
            'image': this.character.imagePath,
            'color': this.character.color
          })
          this.isLoading = false;
        })
      } else {
        this.mode = 'create';
        this.characterId = null;
        this.character = {
          characterName: '',
          weaponName: '',
          characterGUID: '',
          primaryWeapon: false,
          color: '',
          imagePath: ''
        };
      }
    });
  }

  // Handle image selection
  onImagePicked(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    if (fileInput && fileInput.files && fileInput.files.length > 0) {
      const file = fileInput.files[0];
      this.form.patchValue({ image: file });
      this.form.get('image')?.updateValueAndValidity();
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      }
      reader.readAsDataURL(file);
    }
  }

  onSaveCharacter() {
    if (this.form.invalid) return;

    this.isLoading = true;
    if (this.mode === 'create') {
      this.charactersService.addCharacter(
        this.form.value.characterGUID,
        this.form.value.characterName,
        this.form.value.weaponName,
        this.form.value.primaryWeapon,
        this.form.value.color,
        this.form.value.image
      );
    } else {
      this.charactersService.updateCharacter(
        this.characterId,
        this.form.value.characterGUID,
        this.form.value.characterName,
        this.form.value.weaponName,
        this.form.value.primaryWeapon,
        this.form.value.color,
        this.form.value.image
      )
    }
    this.form.reset();
  }

  // Clean up subscriptions on component destroy
  ngOnDestroy() {
    this.authStatusSub.unsubscribe();
  }
}

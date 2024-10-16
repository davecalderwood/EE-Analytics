import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedModule } from '../shared.module';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { mimeType } from '../mime-type.validator';
import { EquipmentService } from './equipment.service';

@Component({
  selector: 'app-equipment',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './equipment.component.html',
  styleUrl: './equipment.component.scss'
})
export class EquipmentComponent implements OnInit, OnDestroy {
  private mode = 'create';
  private equipmentId!: any;
  equipment: any;
  isLoading = false;
  form!: FormGroup;
  imagePreview!: string;
  private authStatusSub!: Subscription;

  constructor(
    public equipmentService: EquipmentService,
    public route: ActivatedRoute,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.authStatusSub = this.authService
      .getAuthStatusListener()
      .subscribe(
        authStatus => {
          this.isLoading = false;
        }
      );
    this.form = new FormGroup({
      'equipmentName': new FormControl(null, { validators: [Validators.required] }),
      'equipmentTier': new FormControl(null, { validators: [Validators.required] }),
      'equipmentGUID': new FormControl(null, { validators: [Validators.required] }),
      'image': new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] }),
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('equipmentId')) {
        this.mode = 'edit';
        this.equipmentId = paramMap.get('equipmentId');
        this.isLoading = true;
        this.equipmentService.getEquipment(this.equipmentId).subscribe((equipmentData: any) => {
          this.equipment = {
            id: equipmentData._id,
            equipmentName: equipmentData.equipmentName,
            equipmentTier: equipmentData.equipmentTier,
            equipmentGUID: equipmentData.equipmentGUID,
            imagePath: equipmentData.imagePath,
            creator: equipmentData.creator
          }
          this.form.setValue({
            'equipmentName': this.equipment.equipmentName,
            'equipmentTier': this.equipment.equipmentTier,
            'equipmentGUID': this.equipment.equipmentGUID,
            'image': this.equipment.imagePath
          })
          this.isLoading = false;
        })
      } else {
        this.mode = 'create';
        this.equipmentId = null;
        this.equipment = {
          equipmentName: '',
          equipmentTier: '',
          equipmentGUID: '',
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

  onSaveEquipment() {
    if (this.form.invalid) return;

    this.isLoading = true;
    if (this.mode === 'create') {
      this.equipmentService.addEquipment(
        this.form.value.equipmentGUID,
        this.form.value.equipmentName,
        this.form.value.equipmentTier,
        this.form.value.image
      );
    } else {
      this.equipmentService.updateEquipment(
        this.equipmentId,
        this.form.value.equipmentGUID,
        this.form.value.equipmentName,
        this.form.value.equipmentTier,
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

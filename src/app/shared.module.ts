import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatDialogModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        RouterModule,
    ],
    exports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatCheckboxModule,
        MatDialogModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        RouterModule,
    ],
})
export class SharedModule { }

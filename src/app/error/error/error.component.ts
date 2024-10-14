import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SharedModule } from '../../shared.module';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [
    SharedModule
  ],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class ErrorComponent {
  message = 'An unknown error occurred!';

  constructor(@Inject(MAT_DIALOG_DATA) public data: { message: string }) { }
}

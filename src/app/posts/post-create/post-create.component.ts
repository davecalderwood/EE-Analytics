import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PostsService } from '../posts.service';

@Component({
    selector: 'app-post-create',
    standalone: true,
    imports: [FormsModule, MatInputModule, MatCardModule, MatButtonModule, MatFormFieldModule],
    templateUrl: './post-create.component.html',
    styleUrl: './post-create.component.css'
})
export class PostCreateComponent {
    enteredTitle = '';
    enteredContent = '';

    constructor(public postsService: PostsService) { }

    onAddPost(form: NgForm) {
        if (form.invalid) return;

        this.postsService.addPost(form.value.title, form.value.content);
        form.resetForm();
    }
}

import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PostsService } from '../posts.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, ParamMap } from '@angular/router';

@Component({
    selector: 'app-post-create',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatInputModule,
        MatCardModule,
        MatButtonModule,
        MatFormFieldModule,
        MatProgressSpinnerModule
    ],
    templateUrl: './post-create.component.html',
    styleUrl: './post-create.component.css'
})
export class PostCreateComponent implements OnInit {
    enteredTitle = '';
    enteredContent = '';
    private mode = 'create';
    private postId: any;
    post: any;
    isLoading = false;

    constructor(public postsService: PostsService, public route: ActivatedRoute) { }

    ngOnInit() {
        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if (paramMap.has('postId')) {
                this.mode = 'edit';
                this.postId = paramMap.get('postId');
                this.isLoading = true;
                this.postsService.getPost(this.postId).subscribe((postData: any) => {
                    this.post = {
                        id: postData._id,
                        title: postData.title,
                        content: postData.content
                    }
                    this.isLoading = false;
                })
            } else {
                this.mode = 'create';
                this.postId = null;
                this.post = { title: '', content: '' };
            }
        });
    }

    onSavePost(form: NgForm) {
        if (form.invalid) return;

        this.isLoading = true;
        if (this.mode === 'create') {
            this.postsService.addPost(form.value.title, form.value.content);
        } else {
            this.postsService.updatePost(this.postId, form.value.title, form.value.content)
        }
        form.resetForm();
    }
}

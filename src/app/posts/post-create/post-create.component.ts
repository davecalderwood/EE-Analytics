import { ActivatedRoute, ParamMap } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { mimeType } from './mime-type.validator';
import { PostsService } from '../posts.service';
import { SharedModule } from '../../shared.module';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Component({
    selector: 'app-post-create',
    standalone: true,
    imports: [
        SharedModule
    ],
    templateUrl: './post-create.component.html',
    styleUrl: './post-create.component.css'
})
export class PostCreateComponent implements OnInit, OnDestroy {
    enteredTitle = '';
    enteredContent = '';
    private mode = 'create';
    private postId: any;
    post: any;
    isLoading = false;
    form!: FormGroup;
    imagePreview!: string;
    private authStatusSub!: Subscription;

    constructor(
        public postsService: PostsService,
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
            'title': new FormControl(null, { validators: [Validators.required] }),
            'content': new FormControl(null, { validators: [Validators.required] }),
            'image': new FormControl(null, { validators: [Validators.required], asyncValidators: [mimeType] }),
        });

        this.route.paramMap.subscribe((paramMap: ParamMap) => {
            if (paramMap.has('postId')) {
                this.mode = 'edit';
                this.postId = paramMap.get('postId');
                this.isLoading = true;
                this.postsService.getPost(this.postId).subscribe((postData: any) => {
                    this.post = {
                        id: postData._id,
                        title: postData.title,
                        content: postData.content,
                        imagePath: postData.imagePath,
                        creator: postData.creator
                    }
                    this.form.setValue({
                        'title': this.post.title,
                        'content': this.post.content,
                        'image': this.post.imagePath
                    })
                    this.isLoading = false;
                })
            } else {
                this.mode = 'create';
                this.postId = null;
                this.post = { title: '', content: '' };
            }
        });
    }

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

    onSavePost() {
        if (this.form.invalid) return;

        this.isLoading = true;
        if (this.mode === 'create') {
            this.postsService.addPost(
                this.form.value.title,
                this.form.value.content,
                this.form.value.image
            );
        } else {
            this.postsService.updatePost(
                this.postId,
                this.form.value.title,
                this.form.value.content,
                this.form.value.image
            )
        }
        this.form.reset();
    }

    ngOnDestroy() {
        this.authStatusSub.unsubscribe();
    }
}

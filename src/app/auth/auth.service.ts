import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AuthData } from "./auth-data.model";
import { catchError, of, BehaviorSubject, tap } from "rxjs";
import { Router } from "@angular/router";
import { jwtDecode } from 'jwt-decode';

import { environment } from "../../environment/environment";
const BACKEND_URL = environment.apiURL + '/user/'

@Injectable({ providedIn: 'root' })
export class AuthService {
    private isAuthenticated = false;
    private token!: any;
    private tokenTimer!: ReturnType<typeof setTimeout>;
    private authStatusListener = new BehaviorSubject<boolean>(false);
    private userId!: any;
    expiresInDuration!: number;
    private userRoles: string[] = [];

    constructor(private http: HttpClient, private router: Router) { }

    getToken() {
        return this.token;
    }

    getIsAuth() {
        return this.isAuthenticated;
    }

    getUserId() {
        return this.userId;
    }

    getAuthStatusListener() {
        return this.authStatusListener.asObservable();
    }

    createUser(email: string, password: string) {
        const authData: AuthData = {
            email: email,
            password: password
        }
        return this.http.post(BACKEND_URL + 'signup', authData)
            .pipe(
                catchError(error => {
                    this.authStatusListener.next(false);
                    return of(null);
                })
            )
            .subscribe(() => {
                this.router.navigate(['/signup']);
            });
    }

    getUserRoles(): string[] {
        const token = this.getToken();
        if (!token) return [];
        const decodedToken: any = jwtDecode(token);
        return decodedToken.roles || [];
    }

    hasRole(requiredRole: string): boolean {
        const roles = this.getUserRoles();
        return roles.includes(requiredRole);
    }

    login(email: string, password: string) {
        const authData: AuthData = { email, password };
        this.http.post<{ token: string; expiresIn: number; userId: string }>(BACKEND_URL + '/login', authData)
            .pipe(
                tap(response => {
                    const token = response.token;
                    this.token = token;
                    if (token) {
                        this.expiresInDuration = response.expiresIn;
                        this.setAuthTimer(this.expiresInDuration);
                        this.isAuthenticated = true;
                        this.userId = response.userId;
                        this.authStatusListener.next(true);

                        // **Decode and Store Roles**
                        const decodedToken: any = jwtDecode(token);
                        this.userRoles = decodedToken.roles || [];

                        // Save auth data
                        const now = new Date();
                        const expirationDate = new Date(now.getTime() + this.expiresInDuration * 1000);
                        this.saveAuthData(token, expirationDate, this.userId);
                        this.router.navigate(['/']);
                    }
                }),
                catchError(error => {
                    this.router.navigate(['login']);
                    this.authStatusListener.next(false);
                    return of(null);
                })
            )
            .subscribe();
    }

    autoAuthUser() {
        const authInformation = this.getAuthData();
        if (!authInformation) return; // No auth information, do nothing

        const now = new Date();
        const expiresIn = authInformation.expirationDate.getTime() - now.getTime();

        if (expiresIn > 0) {
            this.token = authInformation.token;
            this.isAuthenticated = true;
            this.userId = authInformation.userId;
            this.setAuthTimer(expiresIn / 1000);

            // Emit true when user is authenticated
            this.authStatusListener.next(true);

            // Decode roles
            const decodedToken: any = jwtDecode(this.token);
            this.userRoles = decodedToken.roles || [];
        } else {
            console.log('Token expired, emitting false');
            this.authStatusListener.next(false); // Emit false if expired
        }
    }

    logout() {
        this.token = null;
        this.isAuthenticated = false;
        this.userRoles = [];
        this.authStatusListener.next(false);
        clearTimeout(this.tokenTimer);
        this.clearAuthData();
        this.router.navigate(['/login']);
    }

    private setAuthTimer(duration: number) {
        this.tokenTimer = setTimeout(() => {
            this.logout();
        }, duration * 1000);
    }

    private saveAuthData(token: string, expirationDate: Date, userId: string) {
        localStorage.setItem('token', token);
        localStorage.setItem('expiration', expirationDate.toISOString());
        localStorage.setItem('userId', userId);
    }

    private clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('expiration');
        localStorage.removeItem('userId');
    }

    private getAuthData() {
        const token = localStorage.getItem('token');
        const expirationDate = localStorage.getItem('expiration');
        const userId = localStorage.getItem('userId');

        if (!token || !expirationDate) {
            return;
        }

        return {
            token: token,
            expirationDate: new Date(expirationDate),
            userId: userId
        }
    }
}
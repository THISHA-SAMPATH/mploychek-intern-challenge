import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, LoginCredentials, User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = '/api';

  currentUser = signal<User | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(private http: HttpClient, private router: Router) {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const token = localStorage.getItem('accessToken');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.currentUser.set(JSON.parse(user));
      this.isAuthenticated.set(true);
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => {
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.currentUser.set(response.user);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    localStorage.clear();
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/auth/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  refreshAccessToken(): Observable<{ accessToken: string }> {
    return this.http
      .post<{ accessToken: string }>(`${this.apiUrl}/auth/refresh`, {
        refreshToken: this.getRefreshToken(),
      })
      .pipe(
        tap((response) => {
          localStorage.setItem('accessToken', response.accessToken);
          this.isAuthenticated.set(true);
        })
      );
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === 'Admin';
  }
}

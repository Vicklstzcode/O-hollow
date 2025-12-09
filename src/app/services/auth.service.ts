import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private isLoggedInKey = 'isLoggedIn';
  private userKey = 'currentUser';

  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {}

  login(usuario: User) {
    localStorage.setItem(this.isLoggedInKey, 'true');
    localStorage.setItem(this.userKey, JSON.stringify(usuario));
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(usuario);
    this.router.navigate(['/home']);
  }

  logout() {
    localStorage.removeItem(this.isLoggedInKey);
    localStorage.removeItem(this.userKey);
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const logged = localStorage.getItem(this.isLoggedInKey);
    return logged === 'true';
  }

  getCurrentUser(): User | null {
    const userJson = localStorage.getItem(this.userKey);
    if (userJson) {
      return JSON.parse(userJson) as User;
    }
    return null;
  }

  updateUserProfile(name: string, email: string): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, name, email };
      localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
      console.log('User profile updated successfully:', updatedUser);
    }
  }

  updateProfileImage(profileImageUrl: string): void {
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      const updatedUser = { ...currentUser, profileImageUrl };
      localStorage.setItem(this.userKey, JSON.stringify(updatedUser));
      this.currentUserSubject.next(updatedUser);
      console.log('User profile image updated successfully:', updatedUser);
    }
  }
}
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

// 1. Definimos e exportamos a interface do Usuário aqui.
export interface User {
  id: number;
  name: string;
  email: string;
  profileImageUrl?: string; // Add this line
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private isLoggedInKey = 'isLoggedIn';
  private userKey = 'currentUser';

  // 2. Criamos os BehaviorSubjects para emitir o estado atual
  private currentUserSubject = new BehaviorSubject<User | null>(this.getCurrentUser());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());

  // 3. Expomos os Observables para os componentes se inscreverem
  public currentUser$ = this.currentUserSubject.asObservable();
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor() {}

  // Salva no navegador que o usuário entrou
  login(usuario: User) {
    localStorage.setItem(this.isLoggedInKey, 'true');
    // 2. Salvamos o objeto de usuário como uma string JSON.
    localStorage.setItem(this.userKey, JSON.stringify(usuario));
    // 4. Notificamos todos os inscritos sobre a mudança
    this.isAuthenticatedSubject.next(true);
    this.currentUserSubject.next(usuario);
    this.router.navigate(['/home']);
  }

  // Limpa os dados e chuta para o login
  logout() {
    localStorage.removeItem(this.isLoggedInKey);
    localStorage.removeItem(this.userKey);
    // 4. Notificamos todos os inscritos sobre a mudança
    this.isAuthenticatedSubject.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // Verifica se está logado (retorna true ou false)
  isAuthenticated(): boolean {
    const logged = localStorage.getItem(this.isLoggedInKey);
    return logged === 'true';
  }

  // 3. Implementamos o método para buscar o usuário.
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
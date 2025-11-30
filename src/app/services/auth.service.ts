import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router);
  private key = 'isLoggedIn';

  constructor() { }

  // Salva no navegador que o usuário entrou
  login(usuario: string) {
    localStorage.setItem(this.key, 'true');
    localStorage.setItem('user', usuario);
    this.router.navigate(['/home']);
  }

  // Limpa os dados e chuta para o login
  logout() {
    localStorage.removeItem(this.key);
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  // Verifica se está logado (retorna true ou false)
  isAuthenticated(): boolean {
    const logged = localStorage.getItem(this.key);
    return logged === 'true';
  }
}
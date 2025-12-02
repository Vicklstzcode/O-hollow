import { Component, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';

declare var lucide: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive,],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, AfterViewInit, OnChanges, OnDestroy {
  @Input() favoritesCount: number = 0;
  
  // A navbar agora gerencia o estado de login e os dados do usuário
  usuarioLogado: boolean = false;
  usuario: User | null = null;
  
  // Inscrições para os observables do AuthService
  private authSubscription: Subscription | undefined;
  private userSubscription: Subscription | undefined;

  mobileMenuAberto: boolean = false;
  @Output() logout = new EventEmitter<void>();

  ngAfterViewInit() {
    this.atualizarIcones();
  }

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Inscreve-se para ouvir mudanças no estado de autenticação
    this.authSubscription = this.authService.isAuthenticated$.subscribe(isAuth => {
      this.usuarioLogado = isAuth;
      this.atualizarIcones();
    });

    // Inscreve-se para ouvir mudanças nos dados do usuário
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.usuario = user;
    });
  }

  ngOnDestroy() {
    this.authSubscription?.unsubscribe();
    this.userSubscription?.unsubscribe();
  }

  ngOnChanges(changes: SimpleChanges) {
    // Garante que o contador de favoritos atualize os ícones se necessário
    if (changes['favoritesCount']) {
      this.atualizarIcones();
    }
  }

  atualizarIcones() {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 50);
  }

  toggleMobileMenu() {
    this.mobileMenuAberto = !this.mobileMenuAberto;
    this.atualizarIcones(); // Garante que ícones no menu (como o 'x') sejam renderizados
  }

  handleLogout() {
    // A navbar agora pode chamar o logout diretamente
    this.authService.logout();
  }
}
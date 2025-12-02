import { Component, Input, Output, EventEmitter, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

declare var lucide: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements AfterViewInit, OnChanges {
  @Input() favoritesCount: number = 0;
  @Input() usuarioLogado: boolean = false;
  @Output() logout = new EventEmitter<void>();

  mobileMenuAberto: boolean = false;

  ngAfterViewInit() {
    this.atualizarIcones();
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
    this.logout.emit();
  }
}
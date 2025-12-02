import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CharacterService, Character } from '../../services/character.service';
import { NavbarComponent } from "../home/navbar.component";

declare var lucide: any;

@Component({
  selector: 'app-favoritos',
  standalone: true,
  templateUrl: './favoritos.component.html',
  styleUrls: ['./favoritos.component.css'],
  imports: [CommonModule, RouterLink, NavbarComponent]
})
export class FavoritosComponent implements OnInit, AfterViewInit {
  meusFavoritos: Character[] = [];
  
  // Variáveis para o Toast
  exibirToast: boolean = false;
  mensagemToast: string = '';
  tipoToast: 'success' | 'info' = 'info';

  constructor(private characterService: CharacterService) {}

  ngOnInit() {
    this.carregarFavoritos();
  }

  ngAfterViewInit() {
    this.atualizarIcones();
  }

  atualizarIcones() {
    // Pequeno delay para garantir que o HTML foi renderizado
    setTimeout(() => {
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
  }

  carregarFavoritos() {
    // 1. Busca a lista de IDs salvos [1, 5, 8...]
    const idsFavoritos = this.characterService.getFavorites();
    // 2. Busca todos os personagens
    const todos = this.characterService.getCharacters();
    
    // 3. Filtra: mantém apenas quem tem o ID na lista de favoritos
    this.meusFavoritos = todos.filter(c => idsFavoritos.includes(c.id));
    
    // Atualiza ícones pois o DOM mudou (novos cards ou lista vazia)
    this.atualizarIcones();
  }

  removerFavorito(id: number, event: Event) {
    event.stopPropagation(); // Não abre o card
    event.preventDefault(); // Não segue o link

    this.characterService.toggleFavorite(id);
    
    // Recarrega a lista para o item sumir imediatamente da tela
    this.carregarFavoritos();
    
    this.mostrarToast('Removido dos favoritos.', 'info');
  }

  // Lógica do Toast (adaptada do seu JS)
  mostrarToast(mensagem: string, tipo: 'success' | 'info') {
    this.mensagemToast = mensagem;
    this.tipoToast = tipo;
    this.exibirToast = true;
    this.atualizarIcones(); // Para o ícone do toast aparecer

    setTimeout(() => {
      this.exibirToast = false;
    }, 3000);
  }
}
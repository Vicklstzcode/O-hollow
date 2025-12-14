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
    setTimeout(() => {
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
  }

  carregarFavoritos() {
    const idsFavoritos = this.characterService.getFavorites();
    const todos = this.characterService.getCharacters();
    this.meusFavoritos = todos.filter(c => idsFavoritos.includes(c.id));
    this.atualizarIcones();
  }

  removerFavorito(id: number, event: Event) {
    event.stopPropagation();
    event.preventDefault();

    this.characterService.toggleFavorite(id);
    this.carregarFavoritos();
    
    this.mostrarToast('Removido dos favoritos.', 'info');
  }

  mostrarToast(mensagem: string, tipo: 'success' | 'info') {
    this.mensagemToast = mensagem;
    this.tipoToast = tipo;
    this.exibirToast = true;
    this.atualizarIcones();

    setTimeout(() => {
      this.exibirToast = false;
    }, 3000);
  }
}
import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CharacterService, Character } from '../../services/character.service';
import { AuthService } from '../../services/auth.service';
// Declaração para os ícones Lucide
declare var lucide: any;

@Component({ template: '' }) // Adicione um decorador @Component mínimo
export class HomeComponent_Temp implements OnInit {
  
  constructor(
    private characterService: CharacterService,
    private router: Router,
    private authService: AuthService // <--- Adicione
  ) {}
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  // ... resto do código ...

  // Adicione esta função
  sair() {
    this.authService.logout();
  }
}



@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
sair() {
throw new Error('Method not implemented.');
}
  
  // === DADOS ===
  todosPersonagens: Character[] = [];
  personagensFiltrados: Character[] = [];
  favoritos: number[] = [];
  
  // === FILTROS ===
  filtros: string[] = ['Todos', 'Marvel', 'TVDU', 'DC', 'Magic', 'Tech'];
  filtroAtual: string = 'Todos';

  // === CARROSSEL ===
  carouselIndex: number = 0;
  carouselItems: Character[] = [];
  private intervaloCarrossel: any;

  // === ARENA DE BATALHA ===
  votosWanda: number = 0;
  votosStrange: number = 0;
  porcentagemWanda: number = 50;
  porcentagemStrange: number = 50;
window: any;

  constructor(
    private characterService: CharacterService,
    private router: Router
  ) {}

  ngOnInit() {
    // 1. Carrega dados do Serviço
    this.todosPersonagens = this.characterService.getCharacters();
    this.personagensFiltrados = [...this.todosPersonagens];
    this.favoritos = this.characterService.getFavorites();
    
    // 2. Prepara o Carrossel (pega os 3 primeiros)
    this.carouselItems = this.todosPersonagens.slice(0, 3);
    this.iniciarCarrossel();

    // 3. Carrega Votos da Arena
    this.atualizarArena();
  }

  ngAfterViewInit() {
    this.atualizarIcones();
  }

  ngOnDestroy() {
    if (this.intervaloCarrossel) clearInterval(this.intervaloCarrossel);
  }

  atualizarIcones() {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
  }

  // === LÓGICA DE FILTROS ===
  
  mudarFiltro(filtro: string) {
    this.filtroAtual = filtro;
    
    if (filtro === 'Todos') {
      this.personagensFiltrados = this.todosPersonagens;
    } else {
      this.personagensFiltrados = this.todosPersonagens.filter(c => 
        c.universe === filtro || c.type === filtro
      );
    }
    this.atualizarIcones(); // Re-renderiza ícones nos novos cards
  }

  filtrarPorBusca(event: any) {
    const termo = event.target.value.toLowerCase();
    this.personagensFiltrados = this.todosPersonagens.filter(c => 
      c.name.toLowerCase().includes(termo) || 
      c.alias.toLowerCase().includes(termo) ||
      c.universe.toLowerCase().includes(termo)
    );
    this.atualizarIcones();
  }

  // === LÓGICA DO CARROSSEL ===

  iniciarCarrossel() {
    this.intervaloCarrossel = setInterval(() => {
      this.proximoSlide();
    }, 5000);
  }

  proximoSlide() {
    this.carouselIndex = (this.carouselIndex + 1) % this.carouselItems.length;
  }

  slideAnterior() {
    this.carouselIndex = (this.carouselIndex - 1 + this.carouselItems.length) % this.carouselItems.length;
  }

  // === LÓGICA DA ARENA ===

  votar(heroi: 'wanda' | 'strange') {
    this.characterService.vote(heroi);
    this.atualizarArena();
  }

  atualizarArena() {
    const votos = this.characterService.getBattleVotes();
    this.votosWanda = votos.wanda;
    this.votosStrange = votos.strange;
    
    const total = this.votosWanda + this.votosStrange;
    if (total > 0) {
      this.porcentagemWanda = Math.round((this.votosWanda / total) * 100);
      this.porcentagemStrange = 100 - this.porcentagemWanda;
    }
  }

  // === AÇÕES ===

  toggleFavorito(id: number, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this.characterService.toggleFavorite(id);
    this.favoritos = this.characterService.getFavorites();
  }

  ehFavorito(id: number): boolean {
    return this.favoritos.includes(id);
  }

  irParaAleatorio() {
    if (this.todosPersonagens.length > 0) {
      const randomId = this.todosPersonagens[Math.floor(Math.random() * this.todosPersonagens.length)].id;
      this.router.navigate(['/detalhes', randomId]);
    }
  }
}
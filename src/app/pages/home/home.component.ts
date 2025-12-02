import { Component, OnInit, AfterViewInit, OnDestroy, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CharacterService, Character } from '../../services/character.service';
import { AuthService } from '../../services/auth.service';

// Declaração para os ícones Lucide
declare var lucide: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink,],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  // === INSCRIÇÕES (Subscriptions) ===
  private charactersSubscription: Subscription | undefined;

  // === CONTROLE DE INTERFACE ===
  mostrarBotaoVoltarAoTopo: boolean = false;

  // === AUTENTICAÇÃO ===
  get usuarioLogado(): boolean {
    return this.authService.isAuthenticated();
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // === SCROLL TO TOP ===
  onWindowScroll() {
    const offset = this.document.documentElement.scrollTop || this.document.body.scrollTop || 0;
    this.mostrarBotaoVoltarAoTopo = offset > 200;
  }

  scrollToTop() {
    this.document.documentElement.scrollTo({ top: 0, behavior: 'smooth' });
    this.document.body.scrollTo({ top: 0, behavior: 'smooth' });
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
  private intervaloCarrossel: any; // Correção: NodeJS.Timeout para any

  // === ARENA DE BATALHA ===
  votosWanda: number = 0;
  votosStrange: number = 0;
  porcentagemWanda: number = 50;
  porcentagemStrange: number = 50;

  constructor(
    private characterService: CharacterService,
    private router: Router,
    private route: ActivatedRoute, // Adicionado para ler parâmetros da rota
    private authService: AuthService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    // Lê o parâmetro 'filtro' da URL, se existir
    this.route.queryParams.subscribe(params => {
      const filtroDaUrl = params['filtro'];
      if (filtroDaUrl && this.filtros.includes(filtroDaUrl)) {
        this.filtroAtual = filtroDaUrl;
      }
    });

    // 1. Inscreve-se para receber atualizações dos personagens
    this.charactersSubscription = this.characterService.getCharactersObservable().subscribe(characters => {
      this.todosPersonagens = characters;
      this.mudarFiltro(this.filtroAtual); // Reaplica o filtro atual com os novos dados
      this.carouselItems = this.todosPersonagens.slice(0, 3);
      this.atualizarIcones();
    });

    // 2. Carrega dados que não são reativos (ou que são gerenciados separadamente)
    this.favoritos = this.characterService.getFavorites();
    this.iniciarCarrossel();
    this.atualizarArena();
  }

  ngAfterViewInit() {
    this.atualizarIcones();
  }

  ngOnDestroy() {
    // Cancela a inscrição para evitar vazamentos de memória
    this.charactersSubscription?.unsubscribe();
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

  scrollToSection(sectionId: string) {
    const element = this.document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
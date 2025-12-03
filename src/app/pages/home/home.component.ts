import { Component, OnInit, AfterViewInit, OnDestroy, Inject, HostListener } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { CharacterService, Character } from '../../services/character.service';
import { AuthService, User } from '../../services/auth.service'; // Importe User do auth.service
import { Subscription } from 'rxjs'; // Importe Subscription do rxjs
import { NavbarComponent } from './navbar.component';

// Declaração para os ícones Lucide
declare var lucide: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
sair() {
throw new Error('Method not implemented.');
}
  // === INSCRIÇÕES (Subscriptions) ===
  private charactersSubscription: Subscription | undefined;

  // === CONTROLE DE INTERFACE ===
  mostrarBotaoVoltarAoTopo: boolean = false;

  // === AUTENTICAÇÃO ===
  usuario: User | null = null; // User type is not exported from auth.service
  get usuarioLogado(): boolean {
    return this.authService.isAuthenticated();
  }

  // === SCROLL TO TOP ===
  @HostListener('window:scroll', [])
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
  groupedCharacters = new Map<string, Character[]>();
  favoritos: number[] = [];
  
  // === FILTROS ===
  filtros: string[] = ['Todos', 'Marvel', 'TVDU', 'DC', 'Magic', 'Tech'];
  filtroAtual: string = 'Todos';
  termoBusca: string = '';
  filtrandoPersonagens: boolean = false;

  // === CARROSSEL ===
  carouselIndex: number = 0;
  carouselItems: Character[] = [];
  private intervaloCarrossel: any; // Correção: NodeJS.Timeout para any

  // === NÍVEL DE AMEAÇA ===
  personagemAmeaca: Character | undefined;
  ameacaVotada: boolean = false;
  niveisAmeaca = [
    { id: 1, nome: 'Nível Rua', cor: '#a3a3a3' },
    { id: 2, nome: 'Meta-Humano', cor: '#3b82f6' },
    { id: 3, nome: 'Planetário', cor: '#f97316' },
    { id: 4, nome: 'Cósmico', cor: '#8b5cf6' },
    { id: 5, nome: 'Divindade', cor: '#fde047' },
  ];
  
  // === CONEXÕES DO MULTIVERSO ===
  personagemCentral: Character | undefined;
  personagensConectados: Character[] = [];
  // Mapa de conexões (simulado, idealmente viria do serviço/API)
  mapaConexoes: { [key: number]: number[] } = {
    1: [2, 3, 5, 10], // Dr. Estranho -> Wanda, Strange Supremo, Clea, Homem-Aranha
    2: [1, 7, 8, 4],  // Wanda -> Dr. Estranho, Visão, Magneto, Strange Supremo
    5: [1, 6, 9],     // Clea -> Dr. Estranho, Dormammu, Umar
    10: [1, 11, 12],  // Homem-Aranha -> Dr. Estranho, Duende Verde, Dr. Octopus
  };

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
        // Se o filtro veio da URL, aplicamos e rolamos para a seção
        this.mudarFiltro(this.filtroAtual);
        this.scrollToSection('featured-section');
      }
    });

    // 1. Inscreve-se para receber atualizações dos personagens
    this.charactersSubscription = this.characterService.getCharactersObservable().subscribe(characters => {
      this.todosPersonagens = characters;
      this.mudarFiltro(this.filtroAtual); // Reaplica o filtro atual com os novos dados
      this.carouselItems = this.todosPersonagens; // Agora o carrossel usa todos os personagens
      
      // Inicia as novas seções se ainda não foram iniciadas
      if (!this.personagemAmeaca) this.novoDesafioAmeaca();
      if (!this.personagemCentral) this.mudarPersonagemCentral(1); // Inicia com Dr. Estranho (ID 1)

      this.atualizarIcones();
    });

    // 2. Carrega dados que não são reativos (ou que são gerenciados separadamente)
    this.favoritos = this.characterService.getFavorites();
    if (this.usuarioLogado) {
      this.usuario = this.authService.getCurrentUser();
    }

    this.iniciarCarrossel();
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
    this.aplicarFiltros();
  }

  filtrarPorBusca(event: any) {
    this.termoBusca = event.target.value.toLowerCase();
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.filtrandoPersonagens = true;

    // Usamos um pequeno setTimeout para garantir que o loader seja exibido na tela
    // antes que a filtragem (que pode ser muito rápida) termine.
    setTimeout(() => {
      let personagens = this.todosPersonagens;

      // 1. Aplica o filtro de categoria (Universo/Tipo)
      if (this.filtroAtual !== 'Todos') {
        personagens = personagens.filter(c => 
          c.universe === this.filtroAtual || c.type === this.filtroAtual
        );
      }

      // 2. Aplica o filtro de busca sobre o resultado anterior
      if (this.termoBusca) {
        personagens = personagens.filter(c => 
          c.name.toLowerCase().includes(this.termoBusca) || 
          c.alias.toLowerCase().includes(this.termoBusca)
        );
      }

      this.personagensFiltrados = personagens;
      
      // Se o filtro for 'Todos', agrupa os personagens para a exibição especial
      if (this.filtroAtual === 'Todos') this.groupCharacters(this.personagensFiltrados);

      this.filtrandoPersonagens = false; // Esconde o loader
      this.atualizarIcones(); // Atualiza os ícones dos novos cards
    }, 250); // Um delay de 250ms é suficiente para a percepção visual.
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

  // === LÓGICA DE AGRUPAMENTO ===

  private groupCharacters(characters: Character[]): void {
    this.groupedCharacters.clear(); // Limpa grupos antigos
    const sortedCharacters = [...characters].sort((a, b) => a.universe.localeCompare(b.universe));
    for (const character of sortedCharacters) {
      if (!this.groupedCharacters.has(character.universe)) {
        this.groupedCharacters.set(character.universe, []);
      }
      this.groupedCharacters.get(character.universe)?.push(character);
    }
  }

  // === LÓGICA DO NÍVEL DE AMEAÇA ===

  novoDesafioAmeaca() {
    if (this.todosPersonagens.length === 0) return;
    const index = Math.floor(Math.random() * this.todosPersonagens.length);
    this.personagemAmeaca = this.todosPersonagens[index];
    this.ameacaVotada = false;
    this.atualizarIcones();
  }

  votarAmeaca(nivelId: number) {
    if (this.ameacaVotada) return;
    console.log(`Votou no personagem ${this.personagemAmeaca?.id} com nível de ameaça ${nivelId}`);
    this.ameacaVotada = true;
    // Aqui você poderia salvar o voto em um serviço
  }

  // === LÓGICA DAS CONEXÕES DO MULTIVERSO ===

  mudarPersonagemCentral(id: number) {
    if (this.todosPersonagens.length === 0) return;

    const novoCentral = this.todosPersonagens.find(p => p.id === id);
    if (!novoCentral) return;

    this.personagemCentral = novoCentral;
    this.carregarConexoes(id);
    this.atualizarIcones();
  }

  carregarConexoes(id: number) {
    const conexoesIds = this.mapaConexoes[id] || [];
    this.personagensConectados = this.todosPersonagens.filter(p => conexoesIds.includes(p.id));

    // Garante que sempre tenhamos 4 conexões para exibir, preenchendo com aleatórios se necessário
    while (this.personagensConectados.length < 4 && this.todosPersonagens.length > this.personagensConectados.length + 1) {
      const randomIndex = Math.floor(Math.random() * this.todosPersonagens.length);
      const randomChar = this.todosPersonagens[randomIndex];
      if (randomChar.id !== id && !this.personagensConectados.some(p => p.id === randomChar.id)) {
        this.personagensConectados.push(randomChar);
      }
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
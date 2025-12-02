import { Component, OnInit, AfterViewInit, OnDestroy, Inject, HostListener } from '@angular/core';
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
  imports: [CommonModule, RouterLink],
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
  favoritos: number[] = [];
  
  // === FILTROS ===
  filtros: string[] = ['Todos', 'Marvel', 'TVDU', 'DC', 'Magic', 'Tech'];
  filtroAtual: string = 'Todos';

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
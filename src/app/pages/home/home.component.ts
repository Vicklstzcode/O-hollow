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
  votoUsuario: number | null = null;
  acertou: boolean | null = null;
  explicacao: string = '';
  
  // === CONEXÕES DO MULTIVERSO ===
  personagemCentral: Character | undefined;
  personagensConectados: (Character & { relacao?: string })[] = [];
  carregandoConexoes: boolean = false; // Adiciona um estado de carregamento

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
      if (!this.personagemCentral) this.mudarPersonagemCentral(1); // Inicia com Feiticeira Escarlate (ID 1)

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

  // Otimização para o *ngFor
  trackByPersonagemId(index: number, item: Character): number {
    return item.id;
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
    
    // Reset state
    this.ameacaVotada = false;
    this.votoUsuario = null;
    this.acertou = null;
    this.explicacao = '';

    this.atualizarIcones();
  }

  votarAmeaca(nivelId: number) {
    if (this.ameacaVotada || !this.personagemAmeaca) return;

    this.votoUsuario = nivelId;
    const correctLevelId = this.getThreatLevelId(this.personagemAmeaca.powerLevel);
    this.acertou = nivelId === correctLevelId;
    this.ameacaVotada = true;
    
    // Gera a explicação detalhada, agora passando o voto do usuário
    this.explicacao = this.getExplicacaoAmeaca(this.personagemAmeaca, this.acertou, this.votoUsuario);
  }

  private getExplicacaoAmeaca(character: Character, acertou: boolean | null, votoUsuario: number | null): string {
    const correctLevelId = this.getThreatLevelId(character.powerLevel);
    const correctLevel = this.niveisAmeaca.find(n => n.id === correctLevelId);
    if (!correctLevel) return 'Nível de ameaça desconhecido.';

    // Helper para gerar uma razão descritiva para uma escolha de nível específica
    const getDescriptiveReason = (levelId: number, char: Character): string => {
        switch (levelId) {
            case 1: // Nível Rua
                return `ter habilidades focadas em combate urbano ou local, como ${char.abilities?.[0]?.toLowerCase() || 'combate corpo-a-corpo'}`;
            case 2: // Meta-Humano
                return `possuir poderes sobre-humanos que representam uma ameaça regional, como ${char.power.toLowerCase() || 'habilidades especiais'}`;
            case 3: // Planetário
                return `ter a capacidade de impactar um planeta inteiro, usando habilidades como ${char.abilities?.[1]?.toLowerCase() || 'poderes de grande escala'}`;
            case 4: // Cósmico
                return `manipular as forças do universo em escala estelar, podendo até ${char.history ? 'alterar a própria realidade' : 'controlar energias cósmicas'}`;
            case 5: // Divindade
                return `ser uma entidade que personifica um conceito fundamental do cosmos, como a própria vida ou a morte`;
            default:
                return '';
        }
    };

    const correctReason = getDescriptiveReason(correctLevelId, character);

    if (acertou) {
        return `Correto! O nível de ameaça de ${character.name} é <strong>${correctLevel.nome}</strong>, pois é capaz de ${correctReason}.`;
    } else {
        const userLevel = this.niveisAmeaca.find(n => n.id === votoUsuario);
        // Caso não encontre o nível do usuário (não deve acontecer)
        if (!userLevel) { 
            return `Incorreto. A resposta certa é <strong>${correctLevel.nome}</strong>, pois ${character.name} é capaz de ${correctReason}.`;
        }
        
        const userReason = getDescriptiveReason(votoUsuario!, character);

        return `Incorreto. Embora seja compreensível associar ${character.name} ao nível <strong>${userLevel.nome}</strong> por ${userReason}, sua verdadeira classificação é <strong>${correctLevel.nome}</strong>. Isso porque seu poder permite ${correctReason}.`;
    }
  }


  public getThreatLevelId(powerLevel: number): number {
    if (powerLevel === 100) {
        return 5; // Divindade
    } else if (powerLevel >= 96) {
        return 4; // Cósmico
    } else if (powerLevel >= 92) {
        return 3; // Planetário
    } else if (powerLevel >= 89) {
        return 2; // Meta-Humano
    } else {
        return 1; // Nível Rua
    }
  }

  // === LÓGICA DAS CONEXÕES DO MULTIVERSO ===

  // Método para selecionar um personagem central aleatório
  pickRandomCentralCharacter() {
    if (this.todosPersonagens.length === 0) return;
    const randomIndex = Math.floor(Math.random() * this.todosPersonagens.length);
    const randomCharacterId = this.todosPersonagens[randomIndex].id;
    this.mudarPersonagemCentral(randomCharacterId);
  }

  mudarPersonagemCentral(id: number) {
    // Previne re-renderização e cliques enquanto carrega
    if (this.personagemCentral?.id === id || this.carregandoConexoes) return;
  
    this.carregandoConexoes = true;
    this.personagensConectados = []; // Limpa as conexões antigas imediatamente
    
    // Encontra o novo personagem central e o define
    this.personagemCentral = this.todosPersonagens.find(p => p.id === id);
  
    // Timeout para dar uma sensação de transição e evitar flickers
    setTimeout(() => {
      if (this.personagemCentral) {
        this.carregarConexoes(this.personagemCentral.id);
      } else {
        // Se o personagem central não for encontrado (ID inválido), seleciona um aleatório
        this.pickRandomCentralCharacter();
      }
      this.carregandoConexoes = false;
      this.atualizarIcones();
    }, 500); // Aumentado para 500ms para uma transição mais suave
  }

  carregarConexoes(id: number) {
    const conexoes = this.characterService.getConnectionsFor(id);
    
    // Mapeia as conexões para incluir a relação no objeto do personagem
    this.personagensConectados = conexoes.map(conexao => {
      const personagem = this.todosPersonagens.find(p => p.id === conexao.id);
      // Retorna uma união do objeto do personagem com a propriedade relacao
      return { ...personagem!, relacao: conexao.relacao };
    }).filter(p => p && p.id); // Filtra caso algum personagem não seja encontrado
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
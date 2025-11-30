import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common'; // Essencial
import { RouterLink, Router } from '@angular/router'; // Para navegação
import { CharacterService, Character } from '../../services/character.service'; // Importa nosso serviço

// Declaração para usar ícones Lucide
declare var lucide: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild('particlesCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  // Dados
  todosPersonagens: Character[] = [];
  personagensFiltrados: Character[] = [];
  favoritos: number[] = [];
  
  // Filtros
  filtros: string[] = ['Todos', 'Marvel', 'TVDU', 'DC', 'Magic', 'Tech'];
  filtroAtual: string = 'Todos';

  // Carrossel
  carouselIndex: number = 0;
  carouselItems: Character[] = []; // Vamos pegar os 3 primeiros para o carrossel

  // Arena
  votosWanda: number = 0;
  votosStrange: number = 0;
  porcentagemWanda: number = 50;
  porcentagemStrange: number = 50;

  // Stats
  stats = [
    { label: "Total de Personagens", value: 0, icon: "users", color: "#06B6D4" },
    { label: "Universos Conectados", value: 0, icon: "globe", color: "#8B5CF6" },
    { label: "Batalhas Simuladas", value: 0, icon: "swords", color: "#F59E0B" },
    { label: "Nível de Ameaça", value: "Moderado", icon: "alert-triangle", color: "#DC2626" },
  ];

  // Toast
  exibirToast: boolean = false;
  mensagemToast: string = '';
  tipoToast: 'success' | 'info' | 'error' = 'success';

  constructor(
    private characterService: CharacterService,
    private router: Router
  ) {}

  ngOnInit() {
    // 1. Carregar dados do Serviço
    this.todosPersonagens = this.characterService.getCharacters();
    this.personagensFiltrados = [...this.todosPersonagens];
    this.carouselItems = this.todosPersonagens.slice(0, 3);
    this.favoritos = this.characterService.getFavorites();

    // 2. Calcular Stats e Votos
    this.calcularStats();
    this.atualizarArena();

    // 3. Iniciar Rotação do Carrossel
    setInterval(() => {
      this.proximoSlide();
    }, 5000);
  }

  ngAfterViewInit() {
    // Renderiza ícones
    this.atualizarIcones();
    // Inicia partículas (placeholder, pois a lógica original do canvas era externa)
    this.initParticles();
  }

  // === FUNCIONALIDADES ===

  atualizarIcones() {
    // Pequeno delay para garantir que o DOM renderizou
    setTimeout(() => {
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
  }

  mudarFiltro(filtro: string) {
    this.filtroAtual = filtro;
    
    if (filtro === 'Todos') {
      this.personagensFiltrados = this.todosPersonagens;
    } else {
      this.personagensFiltrados = this.todosPersonagens.filter(c => 
        c.universe === filtro || c.type === filtro
      );
    }
    this.atualizarIcones();
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

  // === CARROSSEL ===
  proximoSlide() {
    this.carouselIndex = (this.carouselIndex + 1) % this.carouselItems.length;
  }

  slideAnterior() {
    this.carouselIndex = (this.carouselIndex - 1 + this.carouselItems.length) % this.carouselItems.length;
  }

  // === ARENA ===
  votar(heroi: 'wanda' | 'strange') {
    this.characterService.vote(heroi);
    this.atualizarArena();
    this.mostrarToast(`Voto computado para ${heroi === 'wanda' ? 'Feiticeira' : 'Dr. Estranho'}!`, 'success');
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

  // === FAVORITOS & INTERAÇÃO ===
  toggleFavorito(id: number, event: Event) {
    event.stopPropagation(); // Não abre o card
    event.preventDefault(); // Não segue o link

    const adicionou = this.characterService.toggleFavorite(id);
    this.favoritos = this.characterService.getFavorites(); // Recarrega lista
    
    if (adicionou) this.mostrarToast('Adicionado aos favoritos!', 'success');
    else this.mostrarToast('Removido dos favoritos.', 'info');
  }

  ehFavorito(id: number): boolean {
    return this.favoritos.includes(id);
  }

  irParaAleatorio() {
    if (this.todosPersonagens.length > 0) {
      const randomIndex = Math.floor(Math.random() * this.todosPersonagens.length);
      const id = this.todosPersonagens[randomIndex].id;
      this.router.navigate(['/detalhes', id]);
    }
  }

  // === UTILITÁRIOS ===
  mostrarToast(msg: string, tipo: 'success' | 'info' | 'error') {
    this.mensagemToast = msg;
    this.tipoToast = tipo;
    this.exibirToast = true;
    this.atualizarIcones(); // Para o ícone do toast
    
    setTimeout(() => {
      this.exibirToast = false;
    }, 3000);
  }

  calcularStats() {
    const uniqueUniverses = new Set(this.todosPersonagens.map(c => c.universe)).size;
    const maxPower = Math.max(...this.todosPersonagens.map(c => c.powerLevel));
    
    let ameaca = "Moderado";
    if (maxPower >= 98) ameaca = "Cósmico";
    else if (maxPower >= 95) ameaca = "Omega";

    this.stats[0].value = this.todosPersonagens.length;
    this.stats[1].value = uniqueUniverses;
    this.stats[2].value = this.votosWanda + this.votosStrange;
    this.stats[3].value = ameaca as any;
  }

  initParticles() {
    // Aqui você pode adaptar o código do Canvas se ele for curto, 
    // ou deixá-lo vazio por enquanto para focar na lógica principal.
    const canvas = this.canvasRef.nativeElement;
    // ... lógica do canvas ...
  }
}
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; 
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CharacterService, Character } from '../../services/character.service';
import { AuthService } from '../../services/auth.service';
import { AchievementService } from '../../services/achievement.service';
import { NavbarComponent } from "../home/navbar.component";
import { PowerGridComponent } from '../../components/power-grid/power-grid.component';

// Declaração para usar ícones Lucide
declare var lucide: any;

@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent, PowerGridComponent],
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.css'
})
export class DetalhesComponent implements OnInit, AfterViewInit {
  
  personagem: Character | undefined;
  ehFavorito: boolean = false;
  historiaLida: boolean = false;
  
  // Controle de Erro (se o ID não existir)
  encontrado: boolean = true;

  // Variáveis para o Toast
  exibirToast: boolean = false;
  mensagemToast: string = '';
  tipoToast: 'success' | 'info' = 'success';
  
  // === COMENTÁRIOS ===
  comentarios: any[] = [];
  novoComentario: string = '';
  editandoComentarioId: number | null = null;
  textoEditado: string = '';

  // === CONTROLE DE INTERFACE ===
  favoritosCount: number = 0;
  character: any;

  // === AUTENTICAÇÃO ===
  get usuarioLogado(): boolean {
    return this.authService.isAuthenticated();
  }

  constructor(
    private route: ActivatedRoute,
    private characterService: CharacterService,
    private location: Location,
    private authService: AuthService,
    private achievementService: AchievementService
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.personagem = this.characterService.getCharacterById(id);
        
        if (this.personagem) {
          this.encontrado = true;
          this.ehFavorito = this.characterService.getFavorites().includes(this.personagem.id);
          this.carregarComentarios();
          this.favoritosCount = this.characterService.getFavorites().length;
          
          this.achievementService.trackPageVisit(this.personagem.id);
         
          this.atualizarIcones();
        } else {
          this.encontrado = false;
        }
      }
    });
  }

  ngAfterViewInit() {
    this.atualizarIcones();
  }

  atualizarIcones() {
    setTimeout(() => {
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }, 100);
  }

  voltarPagina() {
    this.location.back();
  }

  toggleFavorito() {
    if (this.personagem) {
      const adicionou = this.characterService.toggleFavorite(this.personagem.id);
      this.ehFavorito = adicionou;
      
      this.favoritosCount = this.characterService.getFavorites().length;
      
      this.achievementService.trackFavorite();

      if (adicionou) {
        this.mostrarToast('Adicionado aos favoritos!', 'success');
      } else {
        this.mostrarToast('Removido dos favoritos.', 'info');
      }
    }
  }

  getPowerLevelLabel(powerLevel: number): string {
    if (powerLevel === 100) return 'Quase Onipotente';
    if (powerLevel >= 95) return 'Nível Ômega';
    if (powerLevel >= 90) return 'Extremamente Poderoso';
    if (powerLevel >= 80) return 'Muito Poderoso';
    return 'Poderoso';
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

  // === MÉTODOS PARA COMENTÁRIOS ===

  carregarComentarios() {
    if (this.personagem) {
      this.comentarios = this.characterService.getComments(this.personagem.id);
    }
  }

  adicionarComentario() {
    if (!this.novoComentario.trim() || !this.personagem) return;

    const comentario = {
      user: 'Usuário Logado',
      date: new Date().toISOString(),
      text: this.novoComentario.trim()
    };

    this.characterService.addComment(this.personagem.id, comentario);
    this.novoComentario = '';
    this.carregarComentarios();
    
    // --- GAMIFICATION ---
    this.achievementService.trackComment();

    this.atualizarIcones();
  }

  iniciarEdicao(comentario: any) {
    this.editandoComentarioId = comentario.id;
    this.textoEditado = comentario.text;
    this.atualizarIcones();
  }

  cancelarEdicao() {
    this.editandoComentarioId = null;
    this.textoEditado = '';
  }

  salvarEdicao() {
    if (this.editandoComentarioId && this.personagem) {
      this.characterService.updateComment(this.personagem.id, this.editandoComentarioId, this.textoEditado);
      this.cancelarEdicao();
      this.carregarComentarios();
    }
  }

  excluirComentario(comentarioId: number) {
    if (confirm('Tem certeza que deseja excluir este comentário?')) {
      if (this.personagem) {
        this.characterService.deleteComment(this.personagem.id, comentarioId);
        this.carregarComentarios();
        this.mostrarToast('Comentário excluído.', 'info');
      }
    }
  }

  // --- GAMIFICATION ---
  marcarHistoriaComoLida() {
    if (this.personagem) {
      this.achievementService.trackHistoryRead(this.personagem.id);
      this.historiaLida = true;
      this.mostrarToast('História marcada como lida!', 'info');
    }
  }
}
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; 
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Importado para o ngModel
import { CharacterService, Character } from '../../services/character.service';
import { AuthService } from '../../services/auth.service';
import { NavbarComponent } from "../home/navbar.component"; // Importado para verificar login

// Declaração para usar ícones Lucide
declare var lucide: any;

@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NavbarComponent],
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.css'
})
export class DetalhesComponent implements OnInit, AfterViewInit {
  
  personagem: Character | undefined;
  ehFavorito: boolean = false;
  
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
    private route: ActivatedRoute, // Lê a URL
    private characterService: CharacterService, // Busca os dados
    private location: Location, // Serve para o botão "Voltar"
    private authService: AuthService // Injetado para os comentários
  ) {}

  ngOnInit() {
    // Se inscreve para "ouvir" mudanças no ID da URL
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      if (id) {
        this.personagem = this.characterService.getCharacterById(id);
        
        if (this.personagem) {
          this.encontrado = true; // Garante que a flag de erro seja resetada
          // Se achou, verifica se já é favorito
          this.ehFavorito = this.characterService.getFavorites().includes(this.personagem.id);
          // E carrega os comentários
          this.carregarComentarios();
          // Carrega a contagem de favoritos para a navbar
          this.favoritosCount = this.characterService.getFavorites().length;
          // Atualiza os ícones da página
          this.atualizarIcones();
        } else {
          // Se não achou (ex: ID 999), mostra erro
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
      // Chama o serviço para adicionar/remover
      const adicionou = this.characterService.toggleFavorite(this.personagem.id);
      this.ehFavorito = adicionou; // Atualiza o ícone (cheio ou vazio)
      
      // Atualiza a contagem de favoritos para a navbar
      this.favoritosCount = this.characterService.getFavorites().length;
      
      // Mostra o Toast (igual ao seu JS)
      if (adicionou) {
        this.mostrarToast('Adicionado aos favoritos!', 'success');
      } else {
        this.mostrarToast('Removido dos favoritos.', 'info');
      }
    }
  }

  mostrarToast(mensagem: string, tipo: 'success' | 'info') {
    this.mensagemToast = mensagem;
    this.tipoToast = tipo;
    this.exibirToast = true;
    this.atualizarIcones(); // Para garantir que o ícone do toast apareça

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
      user: 'Usuário Logado', // Em um app real, viria do authService com dados do usuário
      date: new Date().toISOString(),
      text: this.novoComentario.trim()
    };

    this.characterService.addComment(this.personagem.id, comentario);
    this.novoComentario = ''; // Limpa o campo
    this.carregarComentarios(); // Recarrega a lista de comentários
    this.atualizarIcones(); // Garante que ícones de usuário sejam renderizados
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
}
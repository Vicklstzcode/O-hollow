import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; 
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CharacterService, Character } from '../../services/character.service';

// Declaração para usar ícones Lucide
declare var lucide: any;

@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [CommonModule, RouterLink],
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

  constructor(
    private route: ActivatedRoute, // Lê a URL
    private characterService: CharacterService, // Busca os dados
    private location: Location // Serve para o botão "Voltar"
  ) {}

  ngOnInit() {
    // 1. Pega o ID da URL (ex: /detalhes/1 -> id = 1)
    // O '+' ou 'Number()' converte a string '1' para o número 1
    const id = Number(this.route.snapshot.paramMap.get('id'));
    
    // 2. Busca no serviço
    if (id) {
      this.personagem = this.characterService.getCharacterById(id);
      
      if (this.personagem) {
        // Se achou, verifica se já é favorito
        this.verificarFavorito();
      } else {
        // Se não achou (ex: ID 999), mostra erro
        this.encontrado = false;
      }
    }
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

  verificarFavorito() {
    if (this.personagem) {
      const favs = this.characterService.getFavorites();
      this.ehFavorito = favs.includes(this.personagem.id);
    }
  }

  toggleFavorito() {
    if (this.personagem) {
      // Chama o serviço para adicionar/remover
      const adicionou = this.characterService.toggleFavorite(this.personagem.id);
      this.ehFavorito = adicionou; // Atualiza o ícone (cheio ou vazio)
      
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
}
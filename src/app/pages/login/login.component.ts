import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Importamos o serviço de autenticação

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
loginData: any = {};
loginGoogle() {
throw new Error('Method not implemented.');
}
loginDiscord() {
throw new Error('Method not implemented.');
}
  
  // === CONTROLE DE INTERFACE ===
  exibirModal: boolean = false;
  mostrarSenha: boolean = false;
  lgpdAceito: boolean = false;

  // === ANIMAÇÃO DO LOGO ===
  simbolos: string[] = ["ᱬ", "۞", "⚜️", "ᛝ", "⚡", "💀", "🩸", "🌩️"];
  simboloAtual: string = this.simbolos[0];
  opacidadeLogo: number = 1;
  private intervaloLogo: number | undefined;

  // === CARROSSEL DE TEXTOS ===
  features = [
    { icon: "📖", text: "<strong>Explore Dossiês:</strong> Mergulhe em histórias, poderes e afiliações detalhadas." },
    { icon: "⚔️", text: "<strong>Decida Batalhas:</strong> Vote em confrontos épicos na Arena e veja quem a comunidade acha que venceria." },
    { icon: "📊", text: "<strong>Analise o Cosmos:</strong> Acesse um dashboard com o balanço de poder entre os universos." },
    { icon: "❤️", text: "<strong>Crie seu Coven:</strong> Salve seus personagens favoritos em uma coleção pessoal." },
  ];
  featureAtualIndex: number = 0;
  featureAtual = this.features[0];
  classeAnimacaoCarrossel: string = 'slide-in';
  private intervaloCarrossel: number | undefined;
cadastroData: any = {};

  // Injetamos o AuthService e o Router
  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit() {
    this.iniciarRotacaoLogo();
    this.iniciarCarrossel();
  }

  ngOnDestroy() {
    if (this.intervaloLogo) clearInterval(this.intervaloLogo);
    if (this.intervaloCarrossel) clearInterval(this.intervaloCarrossel);
  }

  // === AÇÕES ===

  fazerLogin() {
    console.log('Autenticando...');
    // Chama o serviço para logar o usuário
    // Criamos um objeto User fictício para o login
    this.authService.login({
      id: 1, // ID fictício
      name: 'Usuário Teste', // Nome fictício
      email: 'teste@mysticos.com' // Email fictício
    });
  }

  fazerCadastro() {
    console.log('Cadastro solicitado...');
    this.fecharModalCadastro();
    // Opcional: Já logar o usuário após cadastro
    // this.authService.login('NovoUsuario');
  }

  abrirModalCadastro() {
    this.exibirModal = true;
  }

  fecharModalCadastro() {
    this.exibirModal = false;
  }

  alternarVisualizacaoSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  // === LÓGICA DAS ANIMAÇÕES ===

  iniciarRotacaoLogo() {
    let index = 0;
    this.intervaloLogo = window.setInterval(() => {
      this.opacidadeLogo = 0;
      setTimeout(() => {
        index = (index + 1) % this.simbolos.length;
        this.simboloAtual = this.simbolos[index];
        this.opacidadeLogo = 1;
      }, 500); 
    }, 3000);
  }

  iniciarCarrossel() {
    this.intervaloCarrossel = window.setInterval(() => {
      this.classeAnimacaoCarrossel = 'slide-out';
      setTimeout(() => {
        this.featureAtualIndex = (this.featureAtualIndex + 1) % this.features.length;
        this.featureAtual = this.features[this.featureAtualIndex];
        this.classeAnimacaoCarrossel = 'slide-in';
      }, 500); 
    }, 4000);
  }
}
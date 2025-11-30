import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  
  // === CONTROLE DE INTERFACE ===
  exibirModal: boolean = false;
  mostrarSenha: boolean = false;
  lgpdAceito: boolean = false; // Controla o checkbox e habilita o botão

  // === ANIMAÇÃO DO LOGO ===
  simbolos: string[] = ["ᱬ", "۞", "⚜️", "ᛝ", "⚡", "💀", "🩸", "🌩️"];
  simboloAtual: string = this.simbolos[0];
  opacidadeLogo: number = 1;
  private intervaloLogo: any;

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
  private intervaloCarrossel: any;

  constructor(private router: Router) {}

  ngOnInit() {
    this.iniciarRotacaoLogo();
    this.iniciarCarrossel();
  }

  ngOnDestroy() {
    // Limpa a memória ao sair da tela
    if (this.intervaloLogo) clearInterval(this.intervaloLogo);
    if (this.intervaloCarrossel) clearInterval(this.intervaloCarrossel);
  }

  // === AÇÕES ===

  fazerLogin() {
    console.log('Login solicitado...');
    // Redireciona para a Home
    this.router.navigate(['/home']);
  }

  fazerCadastro() {
    console.log('Cadastro solicitado...');
    // Fecha o modal após "cadastrar"
    this.fecharModalCadastro();
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
    this.intervaloLogo = setInterval(() => {
      // 1. Esmaece
      this.opacidadeLogo = 0;

      // 2. Troca o símbolo (aguarda a transição CSS de 500ms)
      setTimeout(() => {
        index = (index + 1) % this.simbolos.length;
        this.simboloAtual = this.simbolos[index];
        // 3. Reaparece
        this.opacidadeLogo = 1;
      }, 500); 

    }, 3000);
  }

  iniciarCarrossel() {
    this.intervaloCarrossel = setInterval(() => {
      // 1. Anima saída
      this.classeAnimacaoCarrossel = 'slide-out';

      setTimeout(() => {
        // 2. Troca o conteúdo
        this.featureAtualIndex = (this.featureAtualIndex + 1) % this.features.length;
        this.featureAtual = this.features[this.featureAtualIndex];
        
        // 3. Anima entrada
        this.classeAnimacaoCarrossel = 'slide-in';
      }, 500); // Tempo da animação de saída

    }, 4000);
  }
}
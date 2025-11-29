import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  // === VARIÁVEIS DE ESTADO ===
  exibirModal: boolean = false;
  mostrarSenha: boolean = false;
  lgpdAceito: boolean = false;

  // === VARIÁVEIS DO LOGO ===
  simbolos: string[] = ["ᱬ", "۞", "⚜️", "ᛝ", "⚡", "💀", "🩸", "🌩️"];
  simboloAtual: string = this.simbolos[0];
  opacidadeLogo: number = 1;
  private intervaloLogo: any;

  // === VARIÁVEIS DO CARROSSEL ===
  features = [
    { icon: "📖", text: "<strong>Explore Dossiês:</strong> Mergulhe em histórias e poderes." },
    { icon: "⚔️", text: "<strong>Decida Batalhas:</strong> Vote em confrontos épicos na Arena." },
    { icon: "📊", text: "<strong>Analise o Cosmos:</strong> Dashboard com o balanço de poder." },
    { icon: "❤️", text: "<strong>Crie seu Coven:</strong> Salve seus personagens favoritos." },
  ];
  featureAtualIndex: number = 0;
  featureAtual = this.features[0];
  classeAnimacaoCarrossel: string = 'slide-in';
  private intervaloCarrossel: any;

  // === CICLO DE VIDA ===
  ngOnInit() {
    this.iniciarRotacaoLogo();
    this.iniciarCarrossel();
  }

  ngOnDestroy() {
    if (this.intervaloLogo) clearInterval(this.intervaloLogo);
    if (this.intervaloCarrossel) clearInterval(this.intervaloCarrossel);
  }

  // === LÓGICA DO MODAL ===
  abrirModalCadastro() {
    this.exibirModal = true;
  }

  fecharModalCadastro() {
    this.exibirModal = false;
  }

  fecharNoOverlay(event: MouseEvent) {
    this.fecharModalCadastro();
  }

  // === LÓGICA DO FORMULÁRIO ===
  alternarVisualizacaoSenha() {
    this.mostrarSenha = !this.mostrarSenha;
  }

  fazerLogin() {
    console.log('Login acionado');
    // Aqui virá a lógica de conectar com o Backend futuramente
  }

  fazerCadastro() {
    console.log('Cadastro acionado');
  }

  // === FUNÇÕES AUXILIARES (LOGO E CARROSSEL) ===
  iniciarRotacaoLogo() {
    let index = 0;
    this.intervaloLogo = setInterval(() => {
      this.opacidadeLogo = 0; // Começa o fade-out
      setTimeout(() => {
        index = (index + 1) % this.simbolos.length;
        this.simboloAtual = this.simbolos[index];
        this.opacidadeLogo = 1; // Fade-in
      }, 500);
    }, 3000);
  }

  iniciarCarrossel() {
    this.intervaloCarrossel = setInterval(() => {
      this.classeAnimacaoCarrossel = 'slide-out';
      setTimeout(() => {
        this.featureAtualIndex = (this.featureAtualIndex + 1) % this.features.length;
        this.featureAtual = this.features[this.featureAtualIndex];
        this.classeAnimacaoCarrossel = 'slide-in';
      }, 500);
    }, 4000);
  }
}
import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginData: any = {};
  cadastroData: any = {};

  exibirModal: boolean = false;
  mostrarSenha: boolean = false;
  lgpdAceito: boolean = false;
  isReady = signal(false);

  orbIndices = Array.from({ length: 12 }, (_, i) => i);

  constructor(
    private authService: AuthService, 
    private router: Router
  ) {}

  ngOnInit(): void {
    setTimeout(() => this.isReady.set(true), 100);
  }

  fazerLogin() {
    console.log('Autenticando...');
    this.authService.login({
      id: '1',
      name: 'Usuário Teste',
      email: 'teste@mysticos.com'
    });
  }

  fazerCadastro() {
    if (!this.lgpdAceito) {
      alert('Você precisa aceitar os termos de serviço.');
      return;
    }
    if (this.cadastroData.password !== this.cadastroData.confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
    console.log('Cadastro solicitado com os seguintes dados:', this.cadastroData);
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
  
  loginGoogle() {
    console.log('Login com Google não implementado.');
  }

  loginDiscord() {
    console.log('Login com Discord não implementado.');
  }

  getOrbPosition(index: number): { top: string; left: string; animationDelay: string; animationDuration: string } {
    const seed = index * 1234567;
    const random1 = (Math.sin(seed) * 10000) % 100;
    const random2 = (Math.cos(seed) * 10000) % 100;
    
    return {
      top: `${Math.abs(random1)}%`,
      left: `${Math.abs(random2)}%`,
      animationDelay: `${(index % 4) * 0.5}s`,
      animationDuration: `${5 + Math.abs((Math.cos(seed) * 10000) % 5)}s`
    };
  }

  getOrbColor(index: number): string {
    const colors = [
      'from-purple-400 to-pink-400',
      'from-cyan-400 to-blue-400',
      'from-pink-400 to-purple-400',
      'from-yellow-400 to-orange-400'
    ];
    return colors[index % colors.length];
  }
}
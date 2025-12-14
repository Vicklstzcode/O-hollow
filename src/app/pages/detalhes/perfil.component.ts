import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
// RouterLink não é utilizado no template deste componente, então removido
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { NavbarComponent } from '../home/navbar.component';

declare var lucide: any;

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.css']
})
export class PerfilComponent implements OnInit, AfterViewInit {

  usuario: User | null = null;

  nomeUsuario: string = '';
  emailUsuario: string = '';
  selectedFile: File | null = null;
  profileImagePreviewUrl: string | ArrayBuffer | null = null;

  currentPassword = '';
  newPassword = '';
  confirmNewPassword = '';

  constructor(
    private authService: AuthService,
    private location: Location
  ) {}

  ngOnInit() {
    this.usuario = this.authService.getCurrentUser();
    if (this.usuario) {
      this.nomeUsuario = this.usuario.name;
      this.emailUsuario = this.usuario.email;
      this.profileImagePreviewUrl = this.usuario.profileImageUrl || null;
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

  onProfileImageSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImagePreviewUrl = reader.result;
      };
      reader.readAsDataURL(file);
    }
  }

  salvarAlteracoes() {
    if (this.usuario && this.nomeUsuario && this.emailUsuario) {
      this.authService.updateUserProfile(this.nomeUsuario, this.emailUsuario);

      if (this.selectedFile && this.profileImagePreviewUrl) {
        this.authService.updateProfileImage(this.profileImagePreviewUrl.toString());
      }

      this.usuario.name = this.nomeUsuario;
      this.usuario.email = this.emailUsuario;
      if (this.profileImagePreviewUrl) {
        this.usuario.profileImageUrl = this.profileImagePreviewUrl.toString();
      }

      console.log('Alterações salvas com sucesso!');
    } else {
      console.error('Não foi possível salvar as alterações: dados inválidos.');
    }
  }

  alterarSenha() {
    console.log('Iniciando fluxo de alteração de senha...');
    if (!this.currentPassword || !this.newPassword || !this.confirmNewPassword) {
      console.error('Todos os campos de senha devem ser preenchidos.');
      // TODO: Implement error feedback
      return;
    }
    if (this.newPassword !== this.confirmNewPassword) {
      console.error('A nova senha e a confirmação não coincidem.');
      // TODO: Implement error feedback
      return;
    }
    if (this.newPassword.length < 6) {
      console.error('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    console.log('Senha alterada com sucesso (simulado)!');
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  voltarPagina() {
    this.location.back();
  }
}
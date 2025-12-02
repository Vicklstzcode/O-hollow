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

  // Dados do formulário (inicializados com os dados do usuário)
  nomeUsuario: string = '';
  emailUsuario: string = '';
  selectedFile: File | null = null;
  profileImagePreviewUrl: string | ArrayBuffer | null = null;

  // Campos para alteração de senha
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
      // Update name and email
      this.authService.updateUserProfile(this.nomeUsuario, this.emailUsuario);

      // Handle profile image update
      if (this.selectedFile && this.profileImagePreviewUrl) {
        // In a real application, you would upload the file to a server
        // and get a URL back. For this example, we'll store the Data URL.
        this.authService.updateProfileImage(this.profileImagePreviewUrl.toString());
      }

      // Optional: Update the local user object after successful save
      this.usuario.name = this.nomeUsuario;
      this.usuario.email = this.emailUsuario;
      if (this.profileImagePreviewUrl) {
        this.usuario.profileImageUrl = this.profileImagePreviewUrl.toString();
      }

      console.log('Alterações salvas com sucesso!');
      // TODO: Implement a toast notification or similar feedback for the user
    } else {
      console.error('Não foi possível salvar as alterações: dados inválidos.');
      // TODO: Implement error feedback
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
    if (this.newPassword.length < 6) { // Example of a simple validation
      console.error('A nova senha deve ter pelo menos 6 caracteres.');
      // TODO: Implement error feedback
      return;
    }

    // TODO: Call an AuthService method to change the password
    // For example: this.authService.changePassword(this.currentPassword, this.newPassword);
    console.log('Senha alterada com sucesso (simulado)!');
    // TODO: Implement a toast notification or similar feedback for the user
    // Clear password fields after (simulated) successful change
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmNewPassword = '';
  }

  voltarPagina() {
    this.location.back();
  }
}
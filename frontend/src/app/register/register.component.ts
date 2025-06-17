import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../service/usuario.service';
import { Usuario } from '../models/usuario.model';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  usuario: Usuario = {
    nome: '',
    sobrenome: '',
    email: '',
    telefone: '',
    senha: '',
  };

  constructor(private service: UsuarioService) {}

  private emailValido(email: string): boolean {
    const dominiosValidos = [
      'gmail.com',
      'hotmail.com',
      'outlook.com',
      'icloud.com',
    ];
    const regex = /^[^\s@]+@([^\s@]+\.[^\s@]+)$/;
    if (!regex.test(email)) return false;
    const dominio = email.split('@')[1].toLowerCase();
    return dominiosValidos.includes(dominio);
  }

  cadastrar() {
    if (!this.usuario.nome || !this.usuario.sobrenome) {
      alert('Preencha nome e sobrenome');
      return;
    }

    const email = this.usuario.email || '';

    if (!this.emailValido(email)) {
      alert(
        'Use um email com domínio válido: gmail.com, hotmail.com, outlook.com ou icloud.com'
      );
      return;
    }

    if (!this.usuario.senha) {
      alert('Digite a senha');
      return;
    }

    if (this.usuario.telefone?.trim() === '') {
      this.usuario.telefone = null;
    }

    this.service.register(this.usuario).subscribe({
      next: (msg) => alert(msg),
      error: (err) => alert(err.error),
    });
  }

  onTelefoneInput() {
    let tel = this.usuario.telefone || '';

    // Remove tudo que não é número
    tel = tel.replace(/\D/g, '');

    // Limita a 11 dígitos (2 DDD + 9 números)
    if (tel.length > 11) {
      tel = tel.substring(0, 11);
    }

    // Aplica a máscara (11 dígitos): (XX) XXXXX XXXX
    if (tel.length > 6) {
      tel = tel.replace(/^(\d{2})(\d{5})(\d{0,4}).*/, '($1) $2 $3');
    } else if (tel.length > 2) {
      tel = tel.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    } else if (tel.length > 0) {
      tel = tel.replace(/^(\d{0,2})/, '($1');
    }

    this.usuario.telefone = tel.trim();
  }

  somenteNumeros(event: KeyboardEvent) {
    const tecla = event.key;

    // Permite números
    if (/\d/.test(tecla)) {
      return;
    }

    // Permite teclas especiais: backspace, delete, setas, tab
    if (
      tecla === 'Backspace' ||
      tecla === 'Delete' ||
      tecla === 'ArrowLeft' ||
      tecla === 'ArrowRight' ||
      tecla === 'Tab'
    ) {
      return;
    }

    // Bloqueia qualquer outra tecla
    event.preventDefault();
  }
}

// dashteste.component.ts
import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../service/usuario.service';
import { NotificacaoService } from '../service/notificacao.service';
import { Notificacao } from '../models/Notificacao.model'
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashteste',
  templateUrl: './dashteste.component.html',
  styleUrls: ['./dashteste.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
})
export class DashtesteComponent implements OnInit {
  menuAberto = false;
  mostrarNotificacoes = false;
  mostrarFormulario = false;
  menuTimeout: any;
  notificacaoTimeout: any;
  dataHoje: string = '';

  notificacoes: Notificacao[] = [];
  nova: Notificacao = {
    titulo: '',
    descricao: '',
    imagemUrl: '',
  };
  imagemSelecionada: File | null = null;

  constructor(
    public usuarioService: UsuarioService,
    private notificacaoService: NotificacaoService
  ) { }

  ngOnInit(): void {
    this.formatarDataHoje();

    if (this.usuarioService.isLoggedIn()) {
      this.usuarioService.getUsuarioLogado().subscribe({
        next: (user) => (this.usuarioService.nomeUsuario = user.nome),
        error: () => (this.usuarioService.nomeUsuario = ''),
      });
    }

    this.listarNotificacoes();
  }

  private formatarDataHoje() {
    const data = new Date();
    const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    this.dataHoje = `${dias[data.getDay()]}, ${data.getDate()} ${meses[data.getMonth()]} ${data.getFullYear()}`;
  }

  abrirMenu() {
    clearTimeout(this.menuTimeout);
    this.menuAberto = true;
  }

  fecharMenu() {
    this.menuTimeout = setTimeout(() => {
      this.menuAberto = false;
    }, 150);
  }

  abrirNotificacao() {
    clearTimeout(this.notificacaoTimeout);
    this.mostrarNotificacoes = true;
  }

  fecharNotificacao() {
    this.notificacaoTimeout = setTimeout(() => {
      this.mostrarNotificacoes = false;
    }, 150);
  }

  abrirFormularioNotificacao() {
    this.mostrarFormulario = true;
  }

  cancelarFormulario() {
    this.mostrarFormulario = false;
    this.nova = { titulo: '', descricao: '', imagemUrl: '' };
    this.imagemSelecionada = null;
  }

  onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.imagemSelecionada = file;
      const reader = new FileReader();
      reader.onload = () => {
        this.nova.imagemUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  usuarioEhAdmin(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role === 'ADMIN';
    } catch {
      return false;
    }
  }

  salvarNotificacao() {
    this.notificacaoService.criar(this.nova).subscribe(() => {
      this.cancelarFormulario();
      this.listarNotificacoes();
    });
  }

  listarNotificacoes() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) {
      this.notificacaoService.listarVisiveis(token).subscribe({
        next: (res) => (this.notificacoes = res),
        error: () => {
          this.notificacaoService.listar().subscribe((res) => (this.notificacoes = res));
        },
      });
    } else {
      this.notificacaoService.listar().subscribe((res) => (this.notificacoes = res));
    }
  }


}

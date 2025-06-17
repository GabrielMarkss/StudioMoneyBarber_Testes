import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Tabela } from '../models/tabelaServicos.model';
import { UsuarioService } from '../service/usuario.service';

interface Card {
  id?: number;
  titulo: string;
  descricao: string;
  imagemUrl: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent implements OnInit {
  // Formulários
  cardForm: FormGroup;
  servicoForm: FormGroup;
  editCardForm: FormGroup;

  // Controle de Estado
  showCardForm = false;
  showServicoForm = false;
  isEditando = false;
  isEditandoCard = false;
  showEditByIdForm = false;
  servicoEditandoId: number | null = null;
  editandoCardId: number | null = null;
  imagePreview: string | null = null;
  editImagePreview: string | null = null;
  isAdmin = false;

  // Dados
  cards: Card[] = [];
  precos: Tabela[] = [];
  precosPagina1: Tabela[] = [];
  precosPagina2: Tabela[] = [];
  paginaAtual = 1;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private usuarioService: UsuarioService
  ) {
    this.cardForm = this.fb.group({
      titulo: ['', Validators.required],
      descricao: ['', Validators.required],
      imagemFile: [null, Validators.required],
    });

    this.editCardForm = this.fb.group({
      id: [null, Validators.required],
      titulo: ['', Validators.required],
      descricao: ['', Validators.required],
      imagemFile: [null],
    });

    this.servicoForm = this.fb.group({
      nome: ['', Validators.required],
      preco: [null, [Validators.required, Validators.min(0)]],
    });

    const perfil = localStorage.getItem('perfil');
    this.isAdmin = perfil === 'ADMIN';
  }

  ngOnInit(): void {
    this.carregarServicos();
    this.carregarCards();
  }

  logout() {
    this.usuarioService.logout();
  }

  // Cards
  carregarCards(): void {
    this.http.get<Card[]>('http://localhost:8080/api/cards').subscribe({
      next: (cards) => (this.cards = cards),
      error: (err) => console.error('Erro ao carregar cards:', err),
    });
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.cardForm.patchValue({ imagemFile: file });
      const reader = new FileReader();
      reader.onload = () => (this.imagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onEditFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.editCardForm.patchValue({ imagemFile: file });
      const reader = new FileReader();
      reader.onload = () => (this.editImagePreview = reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  salvarCard() {
    if (this.cardForm.invalid) return;

    const formData = new FormData();
    formData.append('titulo', this.cardForm.value.titulo);
    formData.append('descricao', this.cardForm.value.descricao);
    formData.append('imagem', this.cardForm.value.imagemFile);

    const request =
      this.isEditandoCard && this.editandoCardId !== null
        ? this.http.put(
            `http://localhost:8080/api/cards/${this.editandoCardId}`,
            formData
          )
        : this.http.post('http://localhost:8080/api/cards', formData);

    request.subscribe({
      next: () => {
        this.resetarCardForm();
        this.carregarCards();
      },
      error: (err) => console.error('Erro ao salvar card:', err),
    });
  }

  editarCard(card: Card) {
    this.cardForm.patchValue({
      titulo: card.titulo,
      descricao: card.descricao,
      imagemFile: null,
    });
    this.imagePreview = card.imagemUrl;
    this.editandoCardId = card.id!;
    this.isEditandoCard = true;
    this.showCardForm = true;
  }

  editarCardPorId() {
    if (this.editCardForm.invalid) return;

    const formData = new FormData();
    formData.append('titulo', this.editCardForm.value.titulo);
    formData.append('descricao', this.editCardForm.value.descricao);
    if (this.editCardForm.value.imagemFile)
      formData.append('imagem', this.editCardForm.value.imagemFile);

    const id = this.editCardForm.value.id;
    this.http.put(`http://localhost:8080/api/cards/${id}`, formData).subscribe({
      next: () => {
        this.resetarEditCardForm();
        this.carregarCards();
      },
      error: (err) => console.error('Erro ao editar card por ID:', err),
    });
  }

  deletarCard(id: number) {
    this.http.delete(`http://localhost:8080/api/cards/${id}`).subscribe({
      next: () => this.carregarCards(),
      error: (err) => console.error('Erro ao deletar card:', err),
    });
  }

  resetarCardForm() {
    this.cardForm.reset();
    this.imagePreview = null;
    this.isEditandoCard = false;
    this.editandoCardId = null;
    this.showCardForm = false;
  }

  resetarEditCardForm() {
    this.editCardForm.reset();
    this.editImagePreview = null;
    this.showEditByIdForm = false;
  }

  toggleCardForm() {
    this.showCardForm = !this.showCardForm;
    if (this.showCardForm) {
      this.resetarEditCardForm();
      this.showEditByIdForm = false;
    }
    if (!this.showCardForm) this.resetarCardForm();
  }

  toggleEditByIdForm() {
    this.showEditByIdForm = !this.showEditByIdForm;
    if (this.showEditByIdForm) {
      this.resetarCardForm();
      this.showCardForm = false;
    }
    if (!this.showEditByIdForm) this.resetarEditCardForm();
  }

  // Serviços
  carregarServicos(): void {
    this.http
      .get<Tabela[]>('http://localhost:8080/api/tabelaservicos')
      .subscribe((data) => {
        this.precos = data;
        this.paginar();
      });
  }

  salvarServico(): void {
    if (this.servicoForm.invalid) return;

    const servico = this.servicoForm.value;
    const request =
      this.isEditando && this.servicoEditandoId
        ? this.http.put(
            `http://localhost:8080/api/tabelaservicos/${this.servicoEditandoId}`,
            servico
          )
        : this.http.post('http://localhost:8080/api/tabelaservicos', servico);

    request.subscribe({
      next: () => {
        this.carregarServicos();
        this.toggleServicoForm();
      },
      error: (err) => console.error('Erro ao salvar serviço:', err),
    });
  }

  editarServico(servico: Tabela): void {
    this.servicoForm.patchValue({
      nome: servico.nome,
      preco: servico.preco,
    });
    this.servicoEditandoId = servico.id || null;
    this.isEditando = true;
    this.showServicoForm = true;
  }

  deletarServico(id?: number) {
    if (!id) return;
    this.http
      .delete(`http://localhost:8080/api/tabelaservicos/${id}`)
      .subscribe({
        next: () => this.carregarServicos(),
        error: (err) => console.error('Erro ao deletar serviço:', err),
      });
  }

  toggleServicoForm() {
    this.showServicoForm = !this.showServicoForm;
    if (!this.showServicoForm) this.servicoForm.reset();
    this.isEditando = false;
    this.servicoEditandoId = null;
  }

  trocarPagina(pagina: number): void {
    this.paginaAtual = pagina;
    this.paginar();
  }

  private paginar(): void {
    const metade = Math.ceil(this.precos.length / 2);
    this.precosPagina1 = this.precos.slice(0, metade);
    this.precosPagina2 = this.precos.slice(metade);
  }

  openGoogleMaps(): void {
    window.open(
      'https://www.google.com/maps/dir//Studio+Money+Barber...',
      '_blank'
    );
  }
}

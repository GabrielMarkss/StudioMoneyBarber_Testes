import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-card-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule], // ✅ Importando aqui
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent {
  cardForm: FormGroup;
  showForm = false;
  imagePreview: string | null = null;
  isAdmin: boolean = false;

  constructor(private fb: FormBuilder) {
    this.cardForm = this.fb.group({
      titulo: ['', Validators.required],
      descricao: ['', Validators.required],
      imagemFile: [null, Validators.required],
    });

    // Verifica se o perfil salvo é ADMIN
    const perfil = localStorage.getItem('perfil');
    this.isAdmin = perfil === 'ADMIN';
  }

  toggleForm() {
    this.showForm = !this.showForm;
  }

  onFileSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.cardForm.patchValue({ imagemFile: file });
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.cardForm.valid) {
      const { titulo, descricao, imagemFile } = this.cardForm.value;
      console.log('Criando card:', { titulo, descricao, imagemFile });
      this.cardForm.reset();
      this.imagePreview = null;
      this.showForm = false;
    }
  }
}

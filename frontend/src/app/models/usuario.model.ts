export interface Usuario {
  nome: string;
  sobrenome: string;
  admin?: boolean; // opcional, só usado internamente no backend
  email: string;
  telefone: string | null;
  senha: string;
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private api = 'http://localhost:8080/api/usuarios';

  constructor(private http: HttpClient, private router: Router) {}

  login(payload: {
    identificador: string;
    senha: string;
    permanecerConectado: boolean;
  }): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.api}/login`, payload).pipe(
      tap((response) => {
        const token = response.token;
        if (payload.permanecerConectado) {
          localStorage.setItem('token', token);
        } else {
          sessionStorage.setItem('token', token);
        }
      })
    );
  }

  isLoggedIn(): boolean {
    return !!(localStorage.getItem('token') || sessionStorage.getItem('token'));
  }

  register(usuario: any): Observable<string> {
    return this.http.post(`${this.api}/register`, usuario, {
      responseType: 'text',
    });
  }

  logout() {
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    this.router.navigate(['/']); // vai para home ou login
  }
}

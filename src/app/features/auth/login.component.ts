import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthRepository } from '../../data-access/repositories/auth.repository';

@Component({
  standalone: true,
  selector: 'pc-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>PcPedia Portal</h2>
        <form (ngSubmit)="submit()">
          <label>Correo electrónico</label>
          <input [(ngModel)]="email" name="email" placeholder="demo@pcpedia.local" required/>

          <label>Contraseña</label>
          <input [(ngModel)]="password" name="password" type="password" placeholder="••••••" required/>

          <button [disabled]="loading">{{ loading ? 'Ingresando…' : 'Iniciar sesión' }}</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display:flex;justify-content:center;align-items:center;
      height:100vh;background:linear-gradient(135deg,#2b3a55,#485e88);
    }
    .login-card {
      background:#fff;padding:32px 40px;border-radius:16px;
      box-shadow:0 10px 25px rgba(0,0,0,.3);
      width:320px;text-align:center;
    }
    input { width:100%;margin:8px 0;padding:8px;border-radius:8px;border:1px solid #ccc; }
    button { width:100%;padding:10px;border:none;border-radius:8px;background:#2b3a55;color:#fff;font-weight:bold;cursor:pointer; }
  `]
})
export class LoginPage {
  private router = inject(Router);
  private auth = inject(AuthRepository);

  email = '';
  password = '';
  loading = false;

  submit() {
    this.loading = true;
    this.auth.login(this.email, this.password).subscribe({
      next: (ok) => {
        this.loading = false;
        if (ok) this.router.navigate(['/dashboard']);
        else alert('Credenciales inválidas');
      },
      error: () => {
        this.loading = false;
        alert('Credenciales inválidas');
      }
    });
  }
}

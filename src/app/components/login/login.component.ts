import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="login-page">
      <div class="login-bg">
        <div class="bg-orb orb1"></div>
        <div class="bg-orb orb2"></div>
        <div class="bg-orb orb3"></div>
      </div>

      <div class="login-container">
        <div class="login-card">
          <div class="login-header">
            <div class="login-logo">☕</div>
            <h1>Café Manager</h1>
            <p>Système de Gestion de Café</p>
          </div>

          <div *ngIf="errorMsg" class="alert alert-danger">
            <span>⚠️</span> {{ errorMsg }}
          </div>

          <form (ngSubmit)="onLogin()" #loginForm="ngForm">
            <div class="form-group">
              <label class="form-label">👤 Nom d'utilisateur</label>
              <input
                type="text"
                class="form-control"
                [(ngModel)]="username"
                name="username"
                placeholder="Entrez votre nom d'utilisateur"
                required
                autocomplete="username"
              />
            </div>

            <div class="form-group">
              <label class="form-label">🔒 Mot de passe</label>
              <div class="input-pw">
                <input
                  [type]="showPw ? 'text' : 'password'"
                  class="form-control"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="Entrez votre mot de passe"
                  required
                  autocomplete="current-password"
                />
                <button type="button" class="pw-toggle" (click)="showPw = !showPw">
                  {{ showPw ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="btn btn-primary btn-lg login-btn"
              [disabled]="loading || !username || !password"
            >
              <span *ngIf="loading">⏳ Connexion...</span>
              <span *ngIf="!loading">🚀 Se connecter</span>
            </button>
          </form>

          <div class="login-hint">
            <div class="hint-item">
              <span class="hint-role">Admin</span>
              <span class="hint-cred">admin / admin123</span>
            </div>
            <div class="hint-item">
              <span class="hint-role">Caissier</span>
              <span class="hint-cred">caissier / caissier123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-dark);
      position: relative;
    }

    .login-bg {
      position: fixed;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .bg-orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.12;
    }

    .orb1 {
      width: 500px; height: 500px;
      background: var(--primary);
      top: -150px; left: -150px;
      animation: floatOrb 8s ease-in-out infinite;
    }

    .orb2 {
      width: 400px; height: 400px;
      background: #8b4513;
      bottom: -100px; right: -100px;
      animation: floatOrb 10s ease-in-out infinite reverse;
    }

    .orb3 {
      width: 300px; height: 300px;
      background: #d2691e;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
      animation: floatOrb 12s ease-in-out infinite;
    }

    @keyframes floatOrb {
      0%, 100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-30px) scale(1.05); }
    }

    .login-container {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 420px;
      padding: 20px;
    }

    .login-card {
      background: rgba(26, 17, 8, 0.9);
      border: 1px solid rgba(200, 135, 58, 0.25);
      border-radius: 24px;
      padding: 40px;
      backdrop-filter: blur(20px);
      box-shadow: 0 24px 80px rgba(0,0,0,0.5);
    }

    .login-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .login-logo {
      font-size: 3.5rem;
      margin-bottom: 12px;
      display: block;
      filter: drop-shadow(0 0 20px rgba(200, 135, 58, 0.5));
      animation: floatOrb 4s ease-in-out infinite;
    }

    .login-header h1 {
      font-size: 1.8rem;
      font-weight: 800;
      background: linear-gradient(135deg, #f5c842, var(--primary-light), var(--primary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 4px;
    }

    .login-header p {
      font-size: 0.82rem;
      color: var(--text-muted);
    }

    .input-pw {
      position: relative;
    }

    .input-pw .form-control {
      padding-right: 44px;
    }

    .pw-toggle {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .pw-toggle:hover { opacity: 1; }

    .login-btn {
      width: 100%;
      justify-content: center;
      margin-top: 8px;
      padding: 14px;
      font-size: 1rem;
    }

    .login-hint {
      margin-top: 24px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .hint-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: rgba(255,255,255,0.03);
      border-radius: 8px;
      border: 1px solid var(--border);
    }

    .hint-role {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--primary-light);
    }

    .hint-cred {
      font-size: 0.75rem;
      color: var(--text-muted);
      font-family: 'Courier New', monospace;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  loading = false;
  errorMsg = '';
  showPw = false;

  constructor(private authService: AuthService, private router: Router) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  onLogin(): void {
    if (!this.username || !this.password) return;
    this.loading = true;
    this.errorMsg = '';

    this.authService.login({ username: this.username, password: this.password }).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Nom d\'utilisateur ou mot de passe incorrect.';
      }
    });
  }
}

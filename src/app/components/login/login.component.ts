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

      <!-- LEFT PANEL - Brand -->
      <div class="brand-panel">
        <div class="brand-bg-orbs">
          <div class="orb o1"></div>
          <div class="orb o2"></div>
          <div class="orb o3"></div>
        </div>
        <div class="brand-content">
          <div class="brand-icon">
            <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="40" cy="40" r="38" stroke="rgba(200,135,58,0.3)" stroke-width="1.5"/>
              <text x="40" y="52" text-anchor="middle" font-size="34">☕</text>
            </svg>
          </div>
          <h1 class="brand-name">Café Manager</h1>
          <p class="brand-tagline">Système de gestion professionnel</p>

          <div class="brand-features">
            <div class="feature-item">
              <span class="feature-dot"></span>
              <span>Caisse & Commandes</span>
            </div>
            <div class="feature-item">
              <span class="feature-dot"></span>
              <span>Gestion du Stock</span>
            </div>
            <div class="feature-item">
              <span class="feature-dot"></span>
              <span>Rapports & Statistiques</span>
            </div>
            <div class="feature-item">
              <span class="feature-dot"></span>
              <span>Suivi des Dépenses</span>
            </div>
          </div>

        </div>
      </div>

      <!-- RIGHT PANEL - Form -->
      <div class="form-panel">
        <div class="form-inner">

          <div class="form-header">
            <div class="form-logo">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect width="36" height="36" rx="10" fill="rgba(200,135,58,0.15)"/>
                <text x="18" y="24" text-anchor="middle" font-size="18">☕</text>
              </svg>
            </div>
            <div>
              <h2>Bon retour 👋</h2>
              <p class="form-subtitle">Connectez-vous à votre espace</p>
            </div>
          </div>

          <div *ngIf="errorMsg" class="error-alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
            {{ errorMsg }}
          </div>

          <form (ngSubmit)="onLogin()" #loginForm="ngForm" class="login-form">

            <div class="field-group">
              <label class="field-label">Nom d'utilisateur</label>
              <div class="field-wrap">
                <svg class="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <input
                  type="text"
                  class="field-input"
                  [(ngModel)]="username"
                  name="username"
                  placeholder="Votre nom d'utilisateur"
                  required
                  autocomplete="username"
                  [class.has-error]="errorMsg"
                />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Mot de passe</label>
              <div class="field-wrap">
                <svg class="field-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <input
                  [type]="showPw ? 'text' : 'password'"
                  class="field-input pw-input"
                  [(ngModel)]="password"
                  name="password"
                  placeholder="Votre mot de passe"
                  required
                  autocomplete="current-password"
                  [class.has-error]="errorMsg"
                />
                <button type="button" class="pw-eye" (click)="showPw = !showPw" tabindex="-1">
                  <svg *ngIf="!showPw" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg *ngIf="showPw"  width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>

            <button
              type="submit"
              class="login-btn"
              [class.loading]="loading"
              [disabled]="loading || !username || !password"
            >
              <span *ngIf="!loading" class="btn-content">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Se connecter
              </span>
              <span *ngIf="loading" class="btn-content">
                <span class="spinner"></span>
                Connexion...
              </span>
            </button>
          </form>

          <div class="login-footer">
            <span>© 2025 Café Manager. Tous droits réservés.</span>
          </div>

        </div>
      </div>

    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

    * { box-sizing: border-box; margin: 0; padding: 0; }

    .login-page {
      min-height: 100vh;
      display: flex;
      font-family: 'Inter', sans-serif;
      background: #0d0a07;
    }

    /* ===== BRAND PANEL ===== */
    .brand-panel {
      flex: 0 0 45%;
      position: relative;
      overflow: hidden;
      background: linear-gradient(145deg, #0f0804 0%, #1a0e05 40%, #120b04 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    @media (max-width: 768px) { .brand-panel { display: none; } }

    .brand-bg-orbs { position: absolute; inset: 0; pointer-events: none; }
    .orb {
      position: absolute; border-radius: 50%;
      filter: blur(90px); opacity: 0.18;
    }
    .o1 { width: 420px; height: 420px; background: #c8873a; top: -80px; left: -80px; animation: drift 9s ease-in-out infinite; }
    .o2 { width: 300px; height: 300px; background: #8b4513; bottom: -60px; right: -60px; animation: drift 12s ease-in-out infinite reverse; }
    .o3 { width: 200px; height: 200px; background: #f5c842; top: 55%; left: 55%; transform: translate(-50%,-50%); animation: drift 7s ease-in-out infinite 2s; }

    @keyframes drift {
      0%,100% { transform: translate(0,0) scale(1); }
      50% { transform: translate(-20px,-25px) scale(1.08); }
    }

    .brand-content {
      position: relative;
      z-index: 2;
      padding: 48px;
      max-width: 380px;
    }

    .brand-icon {
      width: 90px; height: 90px;
      margin-bottom: 28px;
      filter: drop-shadow(0 0 32px rgba(200,135,58,0.5));
      animation: float 4s ease-in-out infinite;
    }
    @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }

    .brand-name {
      font-size: 2.4rem;
      font-weight: 800;
      background: linear-gradient(135deg, #f5d794 0%, #c8873a 50%, #8b4513 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 8px;
      line-height: 1.1;
    }

    .brand-tagline {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.45);
      margin-bottom: 40px;
      font-weight: 400;
    }

    .brand-features { display: flex; flex-direction: column; gap: 14px; margin-bottom: 48px; }
    .feature-item {
      display: flex; align-items: center; gap: 12px;
      font-size: 0.88rem; color: rgba(255,255,255,0.65);
    }
    .feature-dot {
      width: 7px; height: 7px; border-radius: 50%;
      background: linear-gradient(135deg, #f5c842, #c8873a);
      flex-shrink: 0;
      box-shadow: 0 0 8px rgba(200,135,58,0.7);
    }

    .brand-footer {
      padding-top: 28px;
      border-top: 1px solid rgba(200,135,58,0.12);
      display: flex; align-items: center; gap: 8px;
      font-size: 0.78rem;
      color: rgba(255,255,255,0.3);
    }
    .brand-footer strong { color: rgba(200,135,58,0.7); }

    /* ===== FORM PANEL ===== */
    .form-panel {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      background: #111008;
    }

    .form-inner {
      width: 100%;
      max-width: 420px;
    }

    .form-header {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 36px;
    }

    .form-logo {
      flex-shrink: 0;
      width: 52px; height: 52px;
      background: rgba(200,135,58,0.1);
      border: 1px solid rgba(200,135,58,0.2);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
    }

    .form-header h2 {
      font-size: 1.55rem;
      font-weight: 700;
      color: #f0ebe4;
      margin-bottom: 2px;
    }

    .form-subtitle {
      font-size: 0.82rem;
      color: rgba(255,255,255,0.4);
    }

    /* Error */
    .error-alert {
      display: flex; align-items: center; gap: 10px;
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.25);
      border-radius: 10px;
      padding: 12px 16px;
      color: #f87171;
      font-size: 0.84rem;
      margin-bottom: 24px;
      animation: shake 0.4s ease;
    }
    @keyframes shake {
      0%,100%{transform:translateX(0)} 25%{transform:translateX(-6px)} 75%{transform:translateX(6px)}
    }

    /* Form fields */
    .login-form { display: flex; flex-direction: column; gap: 20px; }

    .field-group { display: flex; flex-direction: column; gap: 8px; }

    .field-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: rgba(255,255,255,0.55);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .field-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .field-icon {
      position: absolute;
      left: 14px;
      color: rgba(200,135,58,0.6);
      pointer-events: none;
      flex-shrink: 0;
    }

    .field-input {
      width: 100%;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 12px;
      padding: 13px 14px 13px 44px;
      color: #f0ebe4;
      font-size: 0.92rem;
      font-family: 'Inter', sans-serif;
      transition: all 0.25s ease;
      outline: none;
    }
    .field-input::placeholder { color: rgba(255,255,255,0.2); }
    .field-input:focus {
      border-color: rgba(200,135,58,0.5);
      background: rgba(200,135,58,0.05);
      box-shadow: 0 0 0 3px rgba(200,135,58,0.1);
    }
    .field-input.has-error { border-color: rgba(239,68,68,0.4); }
    .pw-input { padding-right: 44px; }

    .pw-eye {
      position: absolute; right: 13px;
      background: none; border: none;
      cursor: pointer; color: rgba(255,255,255,0.3);
      display: flex; align-items: center;
      transition: color 0.2s;
      padding: 4px;
    }
    .pw-eye:hover { color: rgba(200,135,58,0.8); }

    /* Login button */
    .login-btn {
      margin-top: 4px;
      width: 100%;
      padding: 14px;
      border: none;
      border-radius: 12px;
      background: linear-gradient(135deg, #c8873a 0%, #a0621e 100%);
      color: #fff;
      font-size: 0.95rem;
      font-weight: 600;
      font-family: 'Inter', sans-serif;
      cursor: pointer;
      transition: all 0.25s ease;
      position: relative;
      overflow: hidden;
    }
    .login-btn::before {
      content: '';
      position: absolute; inset: 0;
      background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 60%);
      opacity: 0;
      transition: opacity 0.25s;
    }
    .login-btn:hover:not(:disabled)::before { opacity: 1; }
    .login-btn:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 8px 28px rgba(200,135,58,0.4);
    }
    .login-btn:active:not(:disabled) { transform: translateY(0); }
    .login-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .login-btn.loading { pointer-events: none; }

    .btn-content {
      display: flex; align-items: center; justify-content: center; gap: 8px;
    }

    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Footer */
    .login-footer {
      margin-top: 32px;
      text-align: center;
      font-size: 0.72rem;
      color: rgba(255,255,255,0.18);
      letter-spacing: 0.02em;
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

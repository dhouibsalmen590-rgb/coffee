import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoginResponse } from '../../models/models';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <div class="app-layout">
      <!-- SIDEBAR -->
      <aside class="sidebar">
        <div class="sidebar-logo">
          <div class="logo-icon-wrap">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
              <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
              <line x1="6" y1="1" x2="6" y2="4" />
              <line x1="10" y1="1" x2="10" y2="4" />
              <line x1="14" y1="1" x2="14" y2="4" />
            </svg>
          </div>
          <div>
            <h2>Café Manager</h2>
            <span>Système de Gestion</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">Principal</div>

          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
              </svg>
            </span>
            Tableau de Bord
          </a>

          <a routerLink="/caisse" routerLinkActive="active" class="nav-item">
            <span class="nav-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="12" y1="10" x2="12" y2="18" />
                <line x1="8" y1="14" x2="16" y2="14" />
              </svg>
            </span>
            Caisse / Commandes
          </a>

          <div class="nav-section-title">Gestion</div>

          <a routerLink="/stock" routerLinkActive="active" class="nav-item">
            <span class="nav-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
            </span>
            Stock & Articles
          </a>

          <a routerLink="/depenses" routerLinkActive="active" class="nav-item">
            <span class="nav-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </span>
            Dépenses
          </a>

          <a routerLink="/historique" routerLinkActive="active" class="nav-item">
            <span class="nav-icon-wrap">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </span>
            Historique
          </a>
        </nav>

        <div class="sidebar-footer">
          <div class="user-info" *ngIf="currentUser">
            <div class="user-avatar">{{ getInitials() }}</div>
            <div>
              <div class="user-name">{{ currentUser.fullName }}</div>
              <div class="user-role">{{ currentUser.role === 'ADMIN' ? '👑 Admin' : '💼 Caissier' }}</div>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Déconnexion
          </button>
        </div>
      </aside>

      <!-- PAGE CONTENT -->
      <main class="main-content">
        <ng-content></ng-content>
      </main>
    </div>
  `
})
export class LayoutComponent implements OnInit {
  currentUser: LoginResponse | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  getInitials(): string {
    if (!this.currentUser?.fullName) return '?';
    return this.currentUser.fullName.split(' ')
      .map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  logout(): void {
    this.authService.logout();
  }
}

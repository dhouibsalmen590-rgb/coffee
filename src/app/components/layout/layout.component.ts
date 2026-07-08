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
          <span class="logo-icon">☕</span>
          <div>
            <h2>Café Manager</h2>
            <span>Système de Gestion</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <div class="nav-section-title">Principal</div>

          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            Tableau de Bord
          </a>

          <a routerLink="/caisse" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🧾</span>
            Caisse / Commandes
          </a>

          <div class="nav-section-title">Gestion</div>

          <a routerLink="/stock" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📦</span>
            Stock & Articles
          </a>

          <a routerLink="/depenses" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">💸</span>
            Dépenses
          </a>

          <a routerLink="/historique" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📋</span>
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
            🚪 Déconnexion
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../layout/layout.component';
import { ApiService } from '../../services/api.service';
import { DashboardStats, Commande } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <div>
          <div class="page-title">📊 Tableau de Bord</div>
          <div class="page-subtitle">Vue d'ensemble de votre café</div>
        </div>
        <div class="header-date">
          📅 {{ today | date:'EEEE dd MMMM yyyy':'':'fr' }}
          &nbsp;⏰ {{ now | date:'HH:mm' }}
        </div>
      </div>

      <div class="page-body">

        <!-- STATS GRID -->
        <div class="grid grid-4" style="margin-bottom: 24px;">
          <div class="stat-card primary">
            <div class="stat-label">Recette du Jour</div>
            <div class="stat-value">{{ (stats?.recetteTotaleJour || 0) | number:'1.3-3' }} DT</div>
            <div class="stat-icon">💰</div>
            <div class="stat-trend" style="color: var(--success)">
              ↗ {{ stats?.nombreCommandesJour || 0 }} commandes
            </div>
          </div>

          <div class="stat-card success">
            <div class="stat-label">Recette du Mois</div>
            <div class="stat-value">{{ (stats?.recetteTotaleMois || 0) | number:'1.3-3' }} DT</div>
            <div class="stat-icon">📈</div>
            <div class="stat-trend" style="color: var(--success)">↗ Ce mois</div>
          </div>

          <div class="stat-card warning">
            <div class="stat-label">Dépenses du Mois</div>
            <div class="stat-value">{{ (stats?.depensesTotalesMois || 0) | number:'1.3-3' }} DT</div>
            <div class="stat-icon">💸</div>
            <div class="stat-trend" style="color: var(--warning)">→ Charges</div>
          </div>

          <div class="stat-card" [class.success]="(stats?.beneficeNetMois || 0) >= 0" [class.danger]="(stats?.beneficeNetMois || 0) < 0">
            <div class="stat-label">Bénéfice Net</div>
            <div class="stat-value" [style.color]="(stats?.beneficeNetMois || 0) >= 0 ? 'var(--success)' : 'var(--danger)'">
              {{ (stats?.beneficeNetMois || 0) | number:'1.3-3' }} DT
            </div>
            <div class="stat-icon">{{ (stats?.beneficeNetMois || 0) >= 0 ? '✅' : '❌' }}</div>
            <div class="stat-trend">Recette - Dépenses</div>
          </div>
        </div>

        <!-- STOCK ALERT -->
        <div *ngIf="(stats?.articlesStockFaible || 0) > 0" class="alert alert-warning" style="margin-bottom: 24px;">
          <span>⚠️</span>
          <strong>{{ stats?.articlesStockFaible }} article(s)</strong> ont un stock faible! Pensez à réapprovisionner.
        </div>

        <!-- RECENT ORDERS -->
        <div class="card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <h3 style="font-size: 1rem; font-weight: 700;">🧾 Commandes Récentes</h3>
            <span class="badge badge-primary">{{ recentCommandes.length }} commandes</span>
          </div>

          <div *ngIf="recentCommandes.length === 0" class="empty-state">
            <div class="empty-icon">🧾</div>
            <p>Aucune commande aujourd'hui</p>
          </div>

          <div class="table-wrapper" *ngIf="recentCommandes.length > 0">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Table</th>
                  <th>Heure</th>
                  <th>Caissier</th>
                  <th>Total</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cmd of recentCommandes">
                  <td><strong>#{{ cmd.id }}</strong></td>
                  <td>🪑 Table {{ cmd.numeroTable }}</td>
                  <td>⏰ {{ cmd.dateHeure | date:'HH:mm' }}</td>
                  <td>👤 {{ cmd.caissier?.fullName }}</td>
                  <td><strong>{{ cmd.montantTotal | number:'1.3-3' }} DT</strong></td>
                  <td>
                    <span class="badge" [ngClass]="getStatutBadge(cmd.statut)">
                      {{ getStatutLabel(cmd.statut) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </app-layout>
  `,
  styles: [`
    .header-date {
      font-size: 0.85rem;
      color: var(--text-muted);
      font-weight: 500;
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentCommandes: Commande[] = [];
  today = new Date();
  now = new Date();

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadData();
    setInterval(() => { this.now = new Date(); }, 1000);
  }

  loadData(): void {
    this.apiService.getDashboardStats().subscribe(s => this.stats = s);
    this.apiService.getCommandes().subscribe(cmds => {
      this.recentCommandes = cmds.slice(-10).reverse();
    });
  }

  getStatutBadge(statut?: string): string {
    switch (statut) {
      case 'PAYEE': return 'badge-success';
      case 'EN_COURS': return 'badge-warning';
      case 'ANNULEE': return 'badge-danger';
      default: return 'badge-primary';
    }
  }

  getStatutLabel(statut?: string): string {
    switch (statut) {
      case 'PAYEE': return '✅ Payée';
      case 'EN_COURS': return '⏳ En cours';
      case 'ANNULEE': return '❌ Annulée';
      default: return statut || '';
    }
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../layout/layout.component';
import { ApiService } from '../../services/api.service';
import { CommandeEventService } from '../../services/commande-event.service';
import { DashboardStats, Commande } from '../../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <div>
          <div class="page-title" style="display: flex; align-items: center; gap: 10px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7" height="9"></rect>
              <rect x="14" y="3" width="7" height="5"></rect>
              <rect x="14" y="12" width="7" height="9"></rect>
              <rect x="3" y="16" width="7" height="5"></rect>
            </svg>
            Tableau de Bord
          </div>
          <div class="page-subtitle">Vue d'ensemble de votre activité</div>
        </div>
        <div class="header-date">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          {{ today | date:'EEEE dd MMMM yyyy':'':'fr' }}
          &nbsp;•&nbsp;
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          {{ now | date:'HH:mm' }}
        </div>
      </div>

      <div class="page-body">

        <!-- STATS GRID -->
        <div class="grid grid-4 animate-in" style="margin-bottom: 24px;">
          <div class="stat-card primary">
            <div class="stat-label">Recette du Jour</div>
            <div class="stat-value">{{ (stats?.recetteTotaleJour || 0) | number:'1.3-3' }} DT</div>
            <div class="stat-icon" style="color: var(--primary);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            </div>
            <div class="stat-trend" style="color: var(--success)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              {{ stats?.nombreCommandesJour || 0 }} commandes
            </div>
          </div>

          <div class="stat-card success">
            <div class="stat-label">Recette du Mois</div>
            <div class="stat-value">{{ (stats?.recetteTotaleMois || 0) | number:'1.3-3' }} DT</div>
            <div class="stat-icon" style="color: var(--success)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
            </div>
            <div class="stat-trend" style="color: var(--success)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
              Mois en cours
            </div>
          </div>

          <div class="stat-card warning">
            <div class="stat-label">Dépenses du Mois</div>
            <div class="stat-value">{{ (stats?.depensesTotalesMois || 0) | number:'1.3-3' }} DT</div>
            <div class="stat-icon" style="color: var(--warning)">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></svg>
            </div>
            <div class="stat-trend" style="color: var(--warning)">
              Charges fixes/variables
            </div>
          </div>

          <div class="stat-card" [class.success]="(stats?.beneficeNetMois || 0) >= 0" [class.danger]="(stats?.beneficeNetMois || 0) < 0">
            <div class="stat-label">Bénéfice Net</div>
            <div class="stat-value" [style.color]="(stats?.beneficeNetMois || 0) >= 0 ? 'var(--success)' : 'var(--danger)'">
              {{ (stats?.beneficeNetMois || 0) | number:'1.3-3' }} DT
            </div>
            <div class="stat-icon" [style.color]="(stats?.beneficeNetMois || 0) >= 0 ? 'var(--success)' : 'var(--danger)'">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            </div>
            <div class="stat-trend">Recette - Dépenses</div>
          </div>
        </div>

        <!-- STOCK ALERT -->
        <div *ngIf="(stats?.articlesStockFaible || 0) > 0" class="alert alert-danger animate-in" style="margin-bottom: 24px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
          <span><strong>Attention: {{ stats?.articlesStockFaible }} article(s)</strong> ont atteint le stock critique.</span>
        </div>

        <!-- RECENT ORDERS -->
        <div class="card animate-in">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <h3 style="font-size: 1rem; font-weight: 700; display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="12" y1="10" x2="12" y2="18" />
                <line x1="8" y1="14" x2="16" y2="14" />
              </svg>
              Commandes Récentes
            </h3>
            <span class="badge badge-primary">{{ recentCommandes.length }} commandes</span>
          </div>

          <div *ngIf="recentCommandes.length === 0" class="empty-state">
            <div class="empty-icon">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="12" y1="10" x2="12" y2="18" />
                <line x1="8" y1="14" x2="16" y2="14" />
              </svg>
            </div>
            <p>Aucune commande enregistrée aujourd'hui</p>
          </div>

          <div class="table-wrapper" *ngIf="recentCommandes.length > 0">
            <table>
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Emplacement</th>
                  <th>Heure</th>
                  <th>Opérateur</th>
                  <th>Montant</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let cmd of recentCommandes">
                  <td><strong>#{{ cmd.id }}</strong></td>
                  <td>
                    <span style="display: flex; align-items: center; gap: 6px;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2"><path d="M3 3h18v18H3z"/></svg>
                      Table {{ cmd.numeroTable }}
                    </span>
                  </td>
                  <td>{{ cmd.dateHeure | date:'HH:mm' }}</td>
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
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--text-muted);
      font-weight: 500;
    }
    .header-date svg {
      opacity: 0.7;
    }
  `]
})
export class DashboardComponent implements OnInit, OnDestroy {
  stats: DashboardStats | null = null;
  recentCommandes: Commande[] = [];
  today = new Date();
  now = new Date();
  private sub = new Subscription();

  constructor(private apiService: ApiService, private commandeEventService: CommandeEventService) {}

  ngOnInit(): void {
    this.loadData();
    setInterval(() => { this.now = new Date(); }, 30000);
    // Rafraîchir automatiquement quand une nouvelle commande est créée
    this.sub.add(
      this.commandeEventService.onNouvelleCommande().subscribe(cmd => {
        // Ajouter la commande en tête de liste immédiatement
        this.recentCommandes = [cmd, ...this.recentCommandes].slice(0, 10);
        // Recharger les stats du serveur (recette, bénéfice, etc.)
        this.apiService.getDashboardStats().subscribe(s => this.stats = s);
      })
    );
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

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
      case 'PAYEE': return 'Payée';
      case 'EN_COURS': return 'En cours';
      case 'ANNULEE': return 'Annulée';
      default: return statut || '';
    }
  }
}

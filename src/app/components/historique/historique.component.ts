import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';
import { ApiService } from '../../services/api.service';
import { Commande } from '../../models/models';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <div>
          <div class="page-title">📋 Historique des Commandes</div>
          <div class="page-subtitle">Toutes les commandes passées</div>
        </div>
        <button class="btn btn-outline btn-sm" (click)="loadCommandes()">🔄 Actualiser</button>
      </div>

      <div class="page-body">

        <!-- STATS -->
        <div class="grid grid-4" style="margin-bottom: 24px;">
          <div class="stat-card success">
            <div class="stat-label">Commandes Payées</div>
            <div class="stat-value">{{ getByStatut('PAYEE') }}</div>
            <div class="stat-icon">✅</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-label">En Cours</div>
            <div class="stat-value">{{ getByStatut('EN_COURS') }}</div>
            <div class="stat-icon">⏳</div>
          </div>
          <div class="stat-card danger">
            <div class="stat-label">Annulées</div>
            <div class="stat-value">{{ getByStatut('ANNULEE') }}</div>
            <div class="stat-icon">❌</div>
          </div>
          <div class="stat-card primary">
            <div class="stat-label">Recette Totale</div>
            <div class="stat-value" style="font-size: 1.2rem;">{{ getRecetteTotal() | number:'1.3-3' }} DT</div>
            <div class="stat-icon">💰</div>
          </div>
        </div>

        <!-- FILTERS -->
        <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
          <select class="form-control" [(ngModel)]="filterStatut" style="max-width: 180px;">
            <option value="">Tous les statuts</option>
            <option value="PAYEE">✅ Payée</option>
            <option value="EN_COURS">⏳ En cours</option>
            <option value="ANNULEE">❌ Annulée</option>
          </select>
          <input type="date" class="form-control" [(ngModel)]="filterDate" style="max-width: 160px;" />
          <input type="number" class="form-control" [(ngModel)]="filterTable" placeholder="🪑 N° Table" style="max-width: 130px;" min="1" />
          <button class="btn btn-outline btn-sm" (click)="clearFilters()">🗑️ Réinitialiser</button>
        </div>

        <div class="card" style="padding: 0;">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Table</th>
                  <th>Date & Heure</th>
                  <th>Caissier</th>
                  <th>Articles</th>
                  <th>Total</th>
                  <th>Reçu</th>
                  <th>Monnaie</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="filteredCommandes.length === 0">
                  <td colspan="10" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    Aucune commande trouvée
                  </td>
                </tr>
                <tr *ngFor="let cmd of filteredCommandes">
                  <td><strong style="color: var(--primary-light);">#{{ cmd.id }}</strong></td>
                  <td>🪑 Table {{ cmd.numeroTable }}</td>
                  <td>
                    <div>📅 {{ cmd.dateHeure | date:'dd/MM/yyyy' }}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">⏰ {{ cmd.dateHeure | date:'HH:mm:ss' }}</div>
                  </td>
                  <td>👤 {{ cmd.caissier?.fullName || '—' }}</td>
                  <td>
                    <div style="max-width: 200px;">
                      <span *ngFor="let l of cmd.lignes; let last = last" style="font-size: 0.78rem; color: var(--text-secondary);">
                        {{ l.article?.nom }} x{{ l.quantite }}<span *ngIf="!last">, </span>
                      </span>
                    </div>
                  </td>
                  <td><strong style="color: var(--text-primary);">{{ cmd.montantTotal | number:'1.3-3' }} DT</strong></td>
                  <td>{{ cmd.montantRecu | number:'1.3-3' }} DT</td>
                  <td [style.color]="(cmd.monnaieRendue || 0) >= 0 ? 'var(--success)' : 'var(--danger)'">
                    {{ cmd.monnaieRendue | number:'1.3-3' }} DT
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getStatutBadge(cmd.statut)">
                      {{ getStatutLabel(cmd.statut) }}
                    </span>
                  </td>
                  <td>
                    <button
                      *ngIf="cmd.statut === 'EN_COURS'"
                      class="btn btn-sm btn-danger"
                      (click)="annulerCommande(cmd)"
                    >❌</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </app-layout>
  `
})
export class HistoriqueComponent implements OnInit {
  commandes: Commande[] = [];
  filterStatut = '';
  filterDate = '';
  filterTable: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void { this.loadCommandes(); }

  loadCommandes(): void {
    this.apiService.getCommandes().subscribe(c => this.commandes = c.reverse());
  }

  get filteredCommandes(): Commande[] {
    return this.commandes.filter(c => {
      const matchStatut = !this.filterStatut || c.statut === this.filterStatut;
      const matchDate = !this.filterDate || (c.dateHeure && c.dateHeure.startsWith(this.filterDate));
      const matchTable = !this.filterTable || c.numeroTable === this.filterTable;
      return matchStatut && matchDate && matchTable;
    });
  }

  getByStatut(s: string): number {
    return this.commandes.filter(c => c.statut === s).length;
  }

  getRecetteTotal(): number {
    return this.commandes.filter(c => c.statut === 'PAYEE')
      .reduce((sum, c) => sum + (c.montantTotal || 0), 0);
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

  clearFilters(): void { this.filterStatut = ''; this.filterDate = ''; this.filterTable = null; }

  annulerCommande(cmd: Commande): void {
    if (confirm(`Annuler la commande #${cmd.id}?`)) {
      this.apiService.annulerCommande(cmd.id!).subscribe(() => this.loadCommandes());
    }
  }
}

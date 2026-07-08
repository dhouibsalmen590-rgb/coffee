import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';
import { ApiService } from '../../services/api.service';
import { Depense } from '../../models/models';

@Component({
  selector: 'app-depenses',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <div>
          <div class="page-title">💸 Dépenses</div>
          <div class="page-subtitle">Suivi de toutes les dépenses du café</div>
        </div>
        <button class="btn btn-primary" (click)="openModal()">➕ Nouvelle Dépense</button>
      </div>

      <div class="page-body">

        <!-- STATS -->
        <div class="grid grid-3" style="margin-bottom: 24px;">
          <div class="stat-card danger">
            <div class="stat-label">Total ce Mois</div>
            <div class="stat-value">{{ getTotalMois() | number:'1.3-3' }} DT</div>
            <div class="stat-icon">📅</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-label">Total cette Année</div>
            <div class="stat-value">{{ getTotalAnnee() | number:'1.3-3' }} DT</div>
            <div class="stat-icon">📊</div>
          </div>
          <div class="stat-card primary">
            <div class="stat-label">Nb Dépenses</div>
            <div class="stat-value">{{ depenses.length }}</div>
            <div class="stat-icon">📋</div>
          </div>
        </div>

        <!-- FILTERS -->
        <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
          <select class="form-control" [(ngModel)]="filterCat" style="max-width: 220px;">
            <option value="">Toutes catégories</option>
            <option value="ACHAT_STOCK">🛒 Achat Stock</option>
            <option value="LOYER">🏠 Loyer</option>
            <option value="SALAIRES">👷 Salaires</option>
            <option value="ELECTRICITE">⚡ Électricité</option>
            <option value="EAU">💧 Eau</option>
            <option value="ENTRETIEN">🔧 Entretien</option>
            <option value="AUTRE">📦 Autre</option>
          </select>
          <input type="date" class="form-control" [(ngModel)]="filterDateDebut" style="max-width: 160px;" />
          <input type="date" class="form-control" [(ngModel)]="filterDateFin" style="max-width: 160px;" />
          <button class="btn btn-outline btn-sm" (click)="clearFilters()">🗑️ Réinitialiser</button>
        </div>

        <div class="card" style="padding: 0;">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Catégorie</th>
                  <th>Date</th>
                  <th>Créé par</th>
                  <th>Montant</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="filteredDepenses.length === 0">
                  <td colspan="6" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    Aucune dépense trouvée
                  </td>
                </tr>
                <tr *ngFor="let d of filteredDepenses">
                  <td><strong>{{ d.description }}</strong></td>
                  <td><span class="cat-pill">{{ getCatIcon(d.categorie) }} {{ getCatLabel(d.categorie) }}</span></td>
                  <td>📅 {{ d.date | date:'dd/MM/yyyy' }}</td>
                  <td>👤 {{ d.creePar?.fullName || '—' }}</td>
                  <td><strong style="color: var(--danger);">{{ d.montant | number:'1.3-3' }} DT</strong></td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-sm btn-outline" (click)="openModal(d)">✏️</button>
                      <button class="btn btn-sm btn-danger" (click)="deleteDepense(d)">🗑️</button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot *ngIf="filteredDepenses.length > 0">
                <tr>
                  <td colspan="4" style="padding: 12px 16px; font-weight: 700; font-size: 0.9rem; color: var(--text-muted);">
                    Total filtré
                  </td>
                  <td style="padding: 12px 16px; font-weight: 700; font-size: 1rem; color: var(--danger);">
                    {{ getTotalFiltre() | number:'1.3-3' }} DT
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </app-layout>

    <!-- DEPENSE MODAL -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">{{ editMode ? '✏️ Modifier la Dépense' : '➕ Nouvelle Dépense' }}</span>
          <button class="modal-close" (click)="closeModal()">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">Description *</label>
          <input type="text" class="form-control" [(ngModel)]="form.description" placeholder="Ex: Achat café arabica" />
        </div>
        <div class="grid grid-2">
          <div class="form-group">
            <label class="form-label">Montant (DT) *</label>
            <input type="number" class="form-control" [(ngModel)]="form.montant" step="0.1" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Date *</label>
            <input type="date" class="form-control" [(ngModel)]="form.date" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Catégorie *</label>
          <select class="form-control" [(ngModel)]="form.categorie">
            <option value="ACHAT_STOCK">🛒 Achat Stock</option>
            <option value="LOYER">🏠 Loyer</option>
            <option value="SALAIRES">👷 Salaires</option>
            <option value="ELECTRICITE">⚡ Électricité</option>
            <option value="EAU">💧 Eau</option>
            <option value="ENTRETIEN">🔧 Entretien</option>
            <option value="AUTRE">📦 Autre</option>
          </select>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px;">
          <button class="btn btn-outline" (click)="closeModal()">Annuler</button>
          <button class="btn btn-primary" (click)="saveDepense()" [disabled]="!form.description || !form.montant">
            💾 Enregistrer
          </button>
        </div>
      </div>
    </div>
  `
})
export class DepensesComponent implements OnInit {
  depenses: Depense[] = [];
  showModal = false;
  editMode = false;
  filterCat = '';
  filterDateDebut = '';
  filterDateFin = '';

  form: Partial<Depense> = {
    description: '', montant: 0, date: new Date().toISOString().split('T')[0], categorie: 'ACHAT_STOCK'
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void { this.loadDepenses(); }

  loadDepenses(): void {
    this.apiService.getDepenses().subscribe(d => this.depenses = d);
  }

  get filteredDepenses(): Depense[] {
    return this.depenses.filter(d => {
      const matchCat = !this.filterCat || d.categorie === this.filterCat;
      const matchDateDebut = !this.filterDateDebut || d.date >= this.filterDateDebut;
      const matchDateFin = !this.filterDateFin || d.date <= this.filterDateFin;
      return matchCat && matchDateDebut && matchDateFin;
    });
  }

  getTotalMois(): number {
    const now = new Date();
    return this.depenses
      .filter(d => {
        const dd = new Date(d.date);
        return dd.getMonth() === now.getMonth() && dd.getFullYear() === now.getFullYear();
      })
      .reduce((s, d) => s + d.montant, 0);
  }

  getTotalAnnee(): number {
    const year = new Date().getFullYear();
    return this.depenses.filter(d => new Date(d.date).getFullYear() === year)
      .reduce((s, d) => s + d.montant, 0);
  }

  getTotalFiltre(): number {
    return this.filteredDepenses.reduce((s, d) => s + d.montant, 0);
  }

  getCatIcon(cat: string): string {
    const m: Record<string, string> = { ACHAT_STOCK: '🛒', LOYER: '🏠', SALAIRES: '👷', ELECTRICITE: '⚡', EAU: '💧', ENTRETIEN: '🔧', AUTRE: '📦' };
    return m[cat] || '📦';
  }

  getCatLabel(cat: string): string {
    const m: Record<string, string> = { ACHAT_STOCK: 'Achat Stock', LOYER: 'Loyer', SALAIRES: 'Salaires', ELECTRICITE: 'Électricité', EAU: 'Eau', ENTRETIEN: 'Entretien', AUTRE: 'Autre' };
    return m[cat] || cat;
  }

  clearFilters(): void { this.filterCat = ''; this.filterDateDebut = ''; this.filterDateFin = ''; }

  openModal(d?: Depense): void {
    this.editMode = !!d;
    this.form = d ? { ...d } : { description: '', montant: 0, date: new Date().toISOString().split('T')[0], categorie: 'ACHAT_STOCK' };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  saveDepense(): void {
    const op = this.editMode
      ? this.apiService.updateDepense(this.form.id!, this.form as Depense)
      : this.apiService.createDepense(this.form as Depense);

    op.subscribe(() => { this.closeModal(); this.loadDepenses(); });
  }

  deleteDepense(d: Depense): void {
    if (confirm(`Supprimer "${d.description}"?`)) {
      this.apiService.deleteDepense(d.id!).subscribe(() => this.loadDepenses());
    }
  }
}

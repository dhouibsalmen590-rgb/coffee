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
          <div class="page-title" style="display: flex; align-items: center; gap: 10px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
            Dépenses
          </div>
          <div class="page-subtitle">Suivi de toutes les charges et sorties d'argent</div>
        </div>
        <button class="btn btn-primary btn-sm" (click)="openModal()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Nouvelle Dépense
        </button>
      </div>

      <div class="page-body">

        <!-- STATS -->
        <div class="grid grid-3 animate-in" style="margin-bottom: 24px;">
          <div class="stat-card danger">
            <div class="stat-label">Total ce Mois</div>
            <div class="stat-value">{{ getTotalMois() | number:'1.3-3' }} DT</div>
            <div class="stat-icon" style="color: var(--danger);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>
          </div>
          <div class="stat-card warning">
            <div class="stat-label">Total cette Année</div>
            <div class="stat-value">{{ getTotalAnnee() | number:'1.3-3' }} DT</div>
            <div class="stat-icon" style="color: var(--warning);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
            </div>
          </div>
          <div class="stat-card primary">
            <div class="stat-label">Nb Dépenses</div>
            <div class="stat-value">{{ depenses.length }}</div>
            <div class="stat-icon" style="color: var(--primary);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
            </div>
          </div>
        </div>

        <!-- FILTERS -->
        <div class="animate-in" style="display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; align-items: center;">
          <select class="form-control" [(ngModel)]="filterCat" style="max-width: 220px;">
            <option value="">Toutes catégories</option>
            <option value="ACHAT_STOCK">Achat Stock</option>
            <option value="LOYER">Loyer</option>
            <option value="SALAIRES">Salaires</option>
            <option value="ELECTRICITE">Électricité</option>
            <option value="EAU">Eau</option>
            <option value="ENTRETIEN">Entretien</option>
            <option value="AUTRE">Autre</option>
          </select>
          <input type="date" class="form-control" [(ngModel)]="filterDateDebut" style="max-width: 160px;" />
          <input type="date" class="form-control" [(ngModel)]="filterDateFin" style="max-width: 160px;" />
          <button class="btn btn-outline btn-sm" (click)="clearFilters()">
            Réinitialiser
          </button>
        </div>

        <div class="card animate-in" style="padding: 0;">
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
                    Aucune dépense enregistrée avec ces filtres.
                  </td>
                </tr>
                <tr *ngFor="let d of filteredDepenses">
                  <td><strong>{{ d.description }}</strong></td>
                  <td>
                    <span class="cat-pill">
                      {{ getCatIcon(d.categorie) }} &nbsp;{{ getCatLabel(d.categorie) }}
                    </span>
                  </td>
                  <td>{{ d.date | date:'dd/MM/yyyy' }}</td>
                  <td>👤 {{ d.creePar?.fullName || '—' }}</td>
                  <td><strong style="color: var(--danger);">{{ d.montant | number:'1.3-3' }} DT</strong></td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn-action-sm outline" (click)="openModal(d)" title="Modifier">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </button>
                      <button class="btn-action-sm danger" (click)="deleteDepense(d)" title="Supprimer">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
              <tfoot *ngIf="filteredDepenses.length > 0">
                <tr>
                  <td colspan="4" style="padding: 14px 16px; font-weight: 700; font-size: 0.88rem; color: var(--text-secondary); border-top: 1px solid var(--border);">
                    Total filtré
                  </td>
                  <td style="padding: 14px 16px; font-weight: 800; font-size: 1rem; color: var(--danger); border-top: 1px solid var(--border);">
                    {{ getTotalFiltre() | number:'1.3-3' }} DT
                  </td>
                  <td style="border-top: 1px solid var(--border);"></td>
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
          <span class="modal-title">{{ editMode ? 'Modifier la Dépense' : 'Nouvelle Dépense' }}</span>
          <button class="modal-close" (click)="closeModal()">✕</button>
        </div>
        <div class="form-group">
          <label class="form-label">Description *</label>
          <input type="text" class="form-control" [(ngModel)]="form.description" placeholder="Ex: Facture d'électricité" />
        </div>
        <div class="grid grid-2">
          <div class="form-group">
            <label class="form-label">Montant (DT) *</label>
            <input type="number" class="form-control" [(ngModel)]="form.montant" step="0.100" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Date *</label>
            <input type="date" class="form-control" [(ngModel)]="form.date" />
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Catégorie *</label>
          <select class="form-control" [(ngModel)]="form.categorie">
            <option value="ACHAT_STOCK">Achat Stock</option>
            <option value="LOYER">Loyer</option>
            <option value="SALAIRES">Salaires</option>
            <option value="ELECTRICITE">Électricité</option>
            <option value="EAU">Eau</option>
            <option value="ENTRETIEN">Entretien</option>
            <option value="AUTRE">Autre</option>
          </select>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 14px;">
          <button class="btn btn-outline" (click)="closeModal()">Annuler</button>
          <button class="btn btn-primary" (click)="saveDepense()" [disabled]="!form.description || !form.montant">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-action-sm {
      width: 28px; height: 28px;
      border-radius: 6px;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      transition: all var(--transition);
    }
    .btn-action-sm.outline:hover {
      background: rgba(200,135,58,0.1);
      color: var(--primary-light);
      border-color: var(--primary);
    }
    .btn-action-sm.danger:hover {
      background: rgba(224,82,82,0.1);
      color: #e05252;
      border-color: #e05252;
    }
  `]
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

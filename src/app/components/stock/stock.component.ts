import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';
import { ApiService } from '../../services/api.service';
import { Article } from '../../models/models';

@Component({
  selector: 'app-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <div>
          <div class="page-title">📦 Stock & Articles</div>
          <div class="page-subtitle">Gestion de l'inventaire et des articles du menu</div>
        </div>
        <div style="display: flex; gap: 10px;">
          <button class="btn btn-outline btn-sm" (click)="loadArticles()">🔄 Actualiser</button>
          <button class="btn btn-primary" (click)="openModal()">➕ Nouvel Article</button>
        </div>
      </div>

      <div class="page-body">

        <!-- STATS -->
        <div class="grid grid-4" style="margin-bottom: 24px;">
          <div class="stat-card primary">
            <div class="stat-label">Total Articles</div>
            <div class="stat-value">{{ articles.length }}</div>
            <div class="stat-icon">📦</div>
          </div>
          <div class="stat-card success">
            <div class="stat-label">Articles Actifs</div>
            <div class="stat-value">{{ getActifs() }}</div>
            <div class="stat-icon">✅</div>
          </div>
          <div class="stat-card warning">
            <div class="stat-label">Stock Faible</div>
            <div class="stat-value">{{ getStockFaible() }}</div>
            <div class="stat-icon">⚠️</div>
          </div>
          <div class="stat-card danger">
            <div class="stat-label">Rupture Stock</div>
            <div class="stat-value">{{ getRuptureStock() }}</div>
            <div class="stat-icon">❌</div>
          </div>
        </div>

        <!-- FILTERS -->
        <div style="display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap;">
          <input type="text" class="form-control" [(ngModel)]="searchTerm"
            placeholder="🔍 Rechercher..." style="max-width: 250px;" />
          <select class="form-control" [(ngModel)]="filterCat" style="max-width: 200px;">
            <option value="">Toutes catégories</option>
            <option value="BOISSON_CHAUDE">☕ Boissons Chaudes</option>
            <option value="BOISSON_FROIDE">🧃 Boissons Froides</option>
            <option value="NOURRITURE">🥪 Nourriture</option>
            <option value="DESSERT">🍰 Desserts</option>
            <option value="AUTRE">📦 Autre</option>
          </select>
          <select class="form-control" [(ngModel)]="filterStock" style="max-width: 180px;">
            <option value="">Tous les stocks</option>
            <option value="LOW">⚠️ Stock faible</option>
            <option value="OUT">❌ Rupture</option>
          </select>
        </div>

        <div class="card" style="padding: 0;">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Catégorie</th>
                  <th>Prix</th>
                  <th>Stock</th>
                  <th>Min. Stock</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let a of filteredArticles">
                  <td>
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <span style="font-size: 1.4rem;">{{ getCatIcon(a.categorie) }}</span>
                      <div>
                        <div style="font-weight: 600;">{{ a.nom }}</div>
                        <div style="font-size: 0.75rem; color: var(--text-muted);">{{ a.description }}</div>
                      </div>
                    </div>
                  </td>
                  <td><span class="cat-pill">{{ getCatLabel(a.categorie) }}</span></td>
                  <td><strong style="color: var(--primary-light);">{{ a.prix | number:'1.3-3' }} DT</strong></td>
                  <td>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span [class.text-warning]="isLowStock(a)" [class.text-danger]="a.stockDisponible === 0"
                        style="font-weight: 700;">
                        {{ a.stockDisponible }}
                      </span>
                      <button class="btn btn-sm btn-outline" (click)="openStockModal(a)" title="Réapprovisionner">
                        📥
                      </button>
                    </div>
                  </td>
                  <td>{{ a.stockMinimum }}</td>
                  <td>
                    <span class="badge"
                      [class.badge-success]="a.actif && !isLowStock(a)"
                      [class.badge-warning]="a.actif && isLowStock(a) && a.stockDisponible > 0"
                      [class.badge-danger]="!a.actif || a.stockDisponible === 0">
                      {{ !a.actif ? '🚫 Inactif' : a.stockDisponible === 0 ? '❌ Rupture' : isLowStock(a) ? '⚠️ Faible' : '✅ OK' }}
                    </span>
                  </td>
                  <td>
                    <div style="display: flex; gap: 6px;">
                      <button class="btn btn-sm btn-outline" (click)="openModal(a)" title="Modifier">✏️</button>
                      <button class="btn btn-sm btn-danger" (click)="deleteArticle(a)" title="Désactiver">🗑️</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </app-layout>

    <!-- ARTICLE MODAL -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">{{ editMode ? '✏️ Modifier l\'article' : '➕ Nouvel Article' }}</span>
          <button class="modal-close" (click)="closeModal()">✕</button>
        </div>
        <div class="grid grid-2">
          <div class="form-group">
            <label class="form-label">Nom *</label>
            <input type="text" class="form-control" [(ngModel)]="form.nom" />
          </div>
          <div class="form-group">
            <label class="form-label">Catégorie *</label>
            <select class="form-control" [(ngModel)]="form.categorie">
              <option value="BOISSON_CHAUDE">☕ Boisson Chaude</option>
              <option value="BOISSON_FROIDE">🧃 Boisson Froide</option>
              <option value="NOURRITURE">🥪 Nourriture</option>
              <option value="DESSERT">🍰 Dessert</option>
              <option value="AUTRE">📦 Autre</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Description</label>
          <input type="text" class="form-control" [(ngModel)]="form.description" />
        </div>
        <div class="grid grid-3">
          <div class="form-group">
            <label class="form-label">Prix (DT) *</label>
            <input type="number" class="form-control" [(ngModel)]="form.prix" step="0.1" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Stock Initial</label>
            <input type="number" class="form-control" [(ngModel)]="form.stockDisponible" min="0" />
          </div>
          <div class="form-group">
            <label class="form-label">Stock Minimum</label>
            <input type="number" class="form-control" [(ngModel)]="form.stockMinimum" min="0" />
          </div>
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 8px;">
          <button class="btn btn-outline" (click)="closeModal()">Annuler</button>
          <button class="btn btn-primary" (click)="saveArticle()" [disabled]="!form.nom || !form.prix">
            💾 Enregistrer
          </button>
        </div>
      </div>
    </div>

    <!-- STOCK MODAL -->
    <div class="modal-overlay" *ngIf="showStockModal" (click)="closeStockModal()">
      <div class="modal" style="max-width: 380px;" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <span class="modal-title">📥 Réapprovisionner</span>
          <button class="modal-close" (click)="closeStockModal()">✕</button>
        </div>
        <p style="color: var(--text-secondary); margin-bottom: 16px; font-size: 0.88rem;">
          Article: <strong>{{ selectedArticle?.nom }}</strong><br/>
          Stock actuel: <strong>{{ selectedArticle?.stockDisponible }}</strong>
        </p>
        <div class="form-group">
          <label class="form-label">Quantité à ajouter</label>
          <input type="number" class="form-control" [(ngModel)]="stockQty" min="1" />
        </div>
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          <button class="btn btn-outline" (click)="closeStockModal()">Annuler</button>
          <button class="btn btn-success" (click)="updateStock()" [disabled]="!stockQty || stockQty <= 0">
            📥 Confirmer
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .text-warning { color: var(--warning) !important; }
    .text-danger { color: var(--danger) !important; }
  `]
})
export class StockComponent implements OnInit {
  articles: Article[] = [];
  showModal = false;
  showStockModal = false;
  editMode = false;
  selectedArticle: Article | null = null;
  stockQty = 10;
  searchTerm = '';
  filterCat = '';
  filterStock = '';

  form: Partial<Article> = {
    nom: '', description: '', prix: 0,
    categorie: 'BOISSON_CHAUDE', stockDisponible: 0, stockMinimum: 5, actif: true
  };

  constructor(private apiService: ApiService) {}

  ngOnInit(): void { this.loadArticles(); }

  loadArticles(): void {
    this.apiService.getAllArticles().subscribe(a => this.articles = a);
  }

  get filteredArticles(): Article[] {
    return this.articles.filter(a => {
      const matchSearch = !this.searchTerm || a.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchCat = !this.filterCat || a.categorie === this.filterCat;
      const matchStock = !this.filterStock
        || (this.filterStock === 'LOW' && this.isLowStock(a) && a.stockDisponible > 0)
        || (this.filterStock === 'OUT' && a.stockDisponible === 0);
      return matchSearch && matchCat && matchStock;
    });
  }

  getActifs(): number { return this.articles.filter(a => a.actif).length; }
  getStockFaible(): number { return this.articles.filter(a => a.actif && this.isLowStock(a) && a.stockDisponible > 0).length; }
  getRuptureStock(): number { return this.articles.filter(a => a.actif && a.stockDisponible === 0).length; }
  isLowStock(a: Article): boolean { return a.stockDisponible <= a.stockMinimum; }

  getCatIcon(cat: string): string {
    const m: Record<string, string> = { BOISSON_CHAUDE: '☕', BOISSON_FROIDE: '🧃', NOURRITURE: '🥪', DESSERT: '🍰', AUTRE: '📦' };
    return m[cat] || '📦';
  }

  getCatLabel(cat: string): string {
    const m: Record<string, string> = { BOISSON_CHAUDE: 'Chaud', BOISSON_FROIDE: 'Froid', NOURRITURE: 'Nourriture', DESSERT: 'Dessert', AUTRE: 'Autre' };
    return m[cat] || cat;
  }

  openModal(article?: Article): void {
    this.editMode = !!article;
    this.form = article ? { ...article } : { nom: '', description: '', prix: 0, categorie: 'BOISSON_CHAUDE', stockDisponible: 0, stockMinimum: 5, actif: true };
    this.showModal = true;
  }

  closeModal(): void { this.showModal = false; }

  saveArticle(): void {
    const op = this.editMode
      ? this.apiService.updateArticle(this.form.id!, this.form as Article)
      : this.apiService.createArticle(this.form as Article);

    op.subscribe(() => { this.closeModal(); this.loadArticles(); });
  }

  openStockModal(a: Article): void { this.selectedArticle = a; this.stockQty = 10; this.showStockModal = true; }
  closeStockModal(): void { this.showStockModal = false; this.selectedArticle = null; }

  updateStock(): void {
    if (!this.selectedArticle) return;
    this.apiService.updateStock(this.selectedArticle.id!, this.stockQty).subscribe(() => {
      this.closeStockModal();
      this.loadArticles();
    });
  }

  deleteArticle(a: Article): void {
    if (confirm(`Désactiver "${a.nom}"?`)) {
      this.apiService.deleteArticle(a.id!).subscribe(() => this.loadArticles());
    }
  }
}

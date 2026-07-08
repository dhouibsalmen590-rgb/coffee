import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Article, Commande, CommandeRequest } from '../../models/models';

interface CartItem {
  article: Article;
  quantite: number;
  sousTotal: number;
}

@Component({
  selector: 'app-caisse',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <div>
          <div class="page-title">🧾 Caisse</div>
          <div class="page-subtitle">{{ now | date:'EEEE dd/MM/yyyy HH:mm:ss' }}</div>
        </div>
        <div style="display:flex; gap: 12px; align-items: center;">
          <div class="table-selector">
            <span style="font-size: 0.82rem; color: var(--text-muted);">🪑 Table:</span>
            <select [(ngModel)]="numeroTable" class="form-control" style="width: 80px; padding: 6px 10px; font-size: 0.9rem;">
              <option *ngFor="let t of tables" [value]="t">{{ t }}</option>
            </select>
          </div>
          <span class="badge badge-primary">👤 {{ currentUserName }}</span>
        </div>
      </div>

      <div class="page-body">
        <div class="caisse-layout">

          <!-- LEFT: MENU ARTICLES -->
          <div class="menu-panel">
            <div class="menu-search">
              <input
                type="text"
                class="form-control"
                [(ngModel)]="searchTerm"
                placeholder="🔍 Rechercher un article..."
              />
            </div>

            <!-- Category Filters -->
            <div class="cat-filters">
              <button
                *ngFor="let cat of categories"
                class="cat-btn"
                [class.active]="selectedCat === cat.value"
                (click)="selectedCat = cat.value"
              >
                {{ cat.icon }} {{ cat.label }}
              </button>
            </div>

            <!-- Articles Grid -->
            <div class="articles-grid">
              <div
                *ngFor="let article of filteredArticles"
                class="article-card"
                [class.out-of-stock]="article.stockDisponible === 0"
                (click)="addToCart(article)"
              >
                <div class="article-icon-wrap">
                  <span class="article-icon">{{ getCategoryIcon(article.categorie) }}</span>
                  <span class="article-qty-badge" *ngIf="getCartQty(article) > 0">{{ getCartQty(article) }}</span>
                </div>
                <div class="article-name">{{ article.nom }}</div>
                <div class="article-price">{{ article.prix | number:'1.3-3' }} DT</div>
                <div class="article-stock" [class.low]="article.stockDisponible <= article.stockMinimum">
                  Stock: {{ article.stockDisponible }}
                </div>
                <div *ngIf="article.stockDisponible === 0" class="out-of-stock-overlay">Rupture</div>
              </div>
            </div>
          </div>

          <!-- RIGHT: CART & PAYMENT -->
          <div class="cart-panel">
            <div class="cart-header">
              <h3>🛒 Commande — Table {{ numeroTable }}</h3>
              <button class="btn btn-sm btn-outline" (click)="clearCart()" [disabled]="cart.length === 0">
                🗑️ Vider
              </button>
            </div>

            <!-- Cart Items -->
            <div class="cart-items">
              <div *ngIf="cart.length === 0" class="cart-empty">
                <div style="font-size: 2.5rem; margin-bottom: 8px;">🛒</div>
                <p>Sélectionnez des articles du menu</p>
              </div>

              <div *ngFor="let item of cart; let i = index" class="cart-item">
                <div class="cart-item-info">
                  <span class="cart-item-name">{{ item.article.nom }}</span>
                  <span class="cart-item-price">{{ item.article.prix | number:'1.3-3' }} DT/u</span>
                </div>
                <div class="cart-item-controls">
                  <button class="qty-btn" (click)="decreaseQty(i)">−</button>
                  <span class="qty-val">{{ item.quantite }}</span>
                  <button class="qty-btn" (click)="increaseQty(i)" [disabled]="item.quantite >= item.article.stockDisponible">+</button>
                  <span class="cart-subtotal">{{ item.sousTotal | number:'1.3-3' }} DT</span>
                  <button class="btn btn-sm btn-danger" (click)="removeFromCart(i)" style="padding: 4px 8px;">✕</button>
                </div>
              </div>
            </div>

            <!-- TOTAL -->
            <div class="cart-total-section">
              <div class="total-row">
                <span>Sous-total</span>
                <span>{{ getTotal() | number:'1.3-3' }} DT</span>
              </div>
              <div class="total-row total-main">
                <span>💰 TOTAL</span>
                <strong>{{ getTotal() | number:'1.3-3' }} DT</strong>
              </div>
            </div>

            <!-- PAYMENT -->
            <div class="payment-section">
              <div class="form-group">
                <label class="form-label">💵 Montant Reçu (DT)</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="montantRecu"
                  [min]="getTotal()"
                  step="0.5"
                  placeholder="0.000"
                  (ngModelChange)="calcMonnaie()"
                />
              </div>

              <div class="monnaie-display" *ngIf="montantRecu > 0">
                <span>💱 Monnaie à rendre:</span>
                <strong [class.negative]="getMonnaie() < 0">{{ getMonnaie() | number:'1.3-3' }} DT</strong>
              </div>

              <div *ngIf="errorMsg" class="alert alert-danger">⚠️ {{ errorMsg }}</div>
              <div *ngIf="successMsg" class="alert alert-success">✅ {{ successMsg }}</div>

              <button
                class="btn btn-success btn-lg"
                style="width: 100%;"
                (click)="validerCommande()"
                [disabled]="cart.length === 0 || montantRecu < getTotal() || loading"
              >
                <span *ngIf="loading">⏳ Traitement...</span>
                <span *ngIf="!loading">✅ Valider la Commande</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RECEIPT MODAL -->
      <div class="modal-overlay" *ngIf="showReceipt" (click)="closeReceipt()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <span class="modal-title">🧾 Reçu de la Commande</span>
            <button class="modal-close" (click)="closeReceipt()">✕</button>
          </div>
          <div class="ticket" *ngIf="lastCommande">
            <div class="ticket-header">
              <div style="font-size: 1.3rem;">☕ CAFÉ MANAGER</div>
              <div>=====================================</div>
              <div>Date: {{ lastCommande.dateHeure | date:'dd/MM/yyyy HH:mm' }}</div>
              <div>Table N°: {{ lastCommande.numeroTable }}</div>
              <div>Caissier: {{ lastCommande.caissier?.fullName }}</div>
              <div>Commande #{{ lastCommande.id }}</div>
              <div>=====================================</div>
            </div>
            <div *ngFor="let ligne of lastCommande.lignes" class="ticket-row">
              <span>{{ ligne.article.nom }} x{{ ligne.quantite }}</span>
              <span>{{ ligne.sousTotal | number:'1.3-3' }} DT</span>
            </div>
            <div class="ticket-row ticket-total">
              <span>TOTAL</span>
              <span>{{ lastCommande.montantTotal | number:'1.3-3' }} DT</span>
            </div>
            <div class="ticket-row">
              <span>Reçu</span>
              <span>{{ lastCommande.montantRecu | number:'1.3-3' }} DT</span>
            </div>
            <div class="ticket-row" style="font-weight: bold; color: #008000;">
              <span>Monnaie</span>
              <span>{{ lastCommande.monnaieRendue | number:'1.3-3' }} DT</span>
            </div>
            <div style="text-align: center; margin-top: 12px; border-top: 1px dashed #ccc; padding-top: 10px;">
              Merci pour votre visite! 😊
            </div>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 16px;">
            <button class="btn btn-primary" style="flex: 1;" (click)="printReceipt()">🖨️ Imprimer</button>
            <button class="btn btn-outline" style="flex: 1;" (click)="closeReceipt()">✕ Fermer</button>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .caisse-layout {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 20px;
      height: calc(100vh - 160px);
    }

    .menu-panel {
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow: hidden;
    }

    .cat-filters {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .cat-btn {
      padding: 6px 14px;
      border-radius: 20px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-secondary);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Poppins', sans-serif;
      transition: all 0.2s;
    }

    .cat-btn.active, .cat-btn:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 10px;
      overflow-y: auto;
      flex: 1;
      padding-bottom: 8px;
    }

    .article-card {
      background: linear-gradient(160deg, var(--bg-card) 0%, var(--bg-card2) 100%);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 14px 10px 12px;
      cursor: pointer;
      transition: all 0.2s ease;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 4px;
      min-height: 130px;
      justify-content: center;
    }

    .article-card:hover {
      border-color: var(--primary);
      transform: translateY(-4px);
      box-shadow: 0 10px 28px rgba(200, 135, 58, 0.25);
      background: linear-gradient(160deg, rgba(200,135,58,0.1) 0%, var(--bg-card2) 100%);
    }

    .article-card:active {
      transform: translateY(-1px) scale(0.97);
    }

    .article-card.out-of-stock {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .article-icon-wrap {
      position: relative;
      display: inline-flex;
      margin-bottom: 2px;
    }

    .article-icon {
      font-size: 2.4rem;
      line-height: 1;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
    }

    .article-qty-badge {
      position: absolute;
      top: -6px;
      right: -10px;
      background: var(--primary);
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--bg-dark);
    }

    .article-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
      max-width: 100%;
      word-break: break-word;
    }

    .article-price {
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--primary-light);
      letter-spacing: 0.2px;
    }

    .article-stock {
      font-size: 0.62rem;
      color: var(--text-muted);
    }

    .article-stock.low { color: var(--warning); }

    .out-of-stock-overlay {
      position: absolute;
      inset: 0;
      background: rgba(0,0,0,0.65);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--danger);
      border-radius: 16px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    }

    /* CART */
    .cart-panel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .cart-header {
      padding: 16px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-card2);
    }

    .cart-header h3 {
      font-size: 0.95rem;
      font-weight: 700;
    }

    .cart-items {
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }

    .cart-empty {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-muted);
      font-size: 0.85rem;
    }

    .cart-item {
      padding: 10px;
      background: rgba(255,255,255,0.03);
      border-radius: 10px;
      margin-bottom: 8px;
      border: 1px solid var(--border);
    }

    .cart-item-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .cart-item-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .cart-item-price {
      font-size: 0.78rem;
      color: var(--text-muted);
    }

    .cart-item-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .qty-btn {
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,0.05);
      color: var(--text-primary);
      font-size: 1.1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Poppins', sans-serif;
      transition: all 0.2s;
    }

    .qty-btn:hover {
      background: var(--primary);
      border-color: var(--primary);
      color: white;
    }

    .qty-val {
      font-size: 0.95rem;
      font-weight: 700;
      min-width: 28px;
      text-align: center;
    }

    .cart-subtotal {
      flex: 1;
      text-align: right;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--primary-light);
    }

    .cart-total-section {
      padding: 12px 16px;
      border-top: 1px solid var(--border);
      background: rgba(200, 135, 58, 0.05);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-secondary);
      padding: 3px 0;
    }

    .total-row.total-main {
      font-size: 1.1rem;
      color: var(--text-primary);
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid var(--border);
    }

    .payment-section {
      padding: 16px;
      border-top: 1px solid var(--border);
    }

    .monnaie-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 12px;
      background: rgba(76, 175, 115, 0.1);
      border: 1px solid rgba(76, 175, 115, 0.3);
      border-radius: 10px;
      margin-bottom: 12px;
      font-size: 0.9rem;
      color: var(--text-secondary);
    }

    .monnaie-display strong {
      font-size: 1.1rem;
      color: var(--success);
    }

    .monnaie-display strong.negative {
      color: var(--danger);
    }

    .table-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class CaisseComponent implements OnInit {
  articles: Article[] = [];
  cart: CartItem[] = [];
  numeroTable = 1;
  tables = Array.from({length: 20}, (_, i) => i + 1);
  montantRecu = 0;
  loading = false;
  errorMsg = '';
  successMsg = '';
  showReceipt = false;
  lastCommande: Commande | null = null;
  searchTerm = '';
  selectedCat = 'ALL';
  now = new Date();
  currentUserName = '';

  categories = [
    { value: 'ALL', label: 'Tous', icon: '🍽️' },
    { value: 'BOISSON_CHAUDE', label: 'Chaud', icon: '☕' },
    { value: 'BOISSON_FROIDE', label: 'Froid', icon: '🧃' },
    { value: 'NOURRITURE', label: 'Nourriture', icon: '🥪' },
    { value: 'DESSERT', label: 'Desserts', icon: '🍰' },
    { value: 'AUTRE', label: 'Autre', icon: '📦' }
  ];

  constructor(private apiService: ApiService, private authService: AuthService) {}

  ngOnInit(): void {
    this.loadArticles();
    const user = this.authService.getCurrentUser();
    this.currentUserName = user?.fullName || '';
    setInterval(() => { this.now = new Date(); }, 1000);
  }

  loadArticles(): void {
    this.apiService.getArticles().subscribe(a => this.articles = a);
  }

  get filteredArticles(): Article[] {
    return this.articles.filter(a => {
      const matchCat = this.selectedCat === 'ALL' || a.categorie === this.selectedCat;
      const matchSearch = !this.searchTerm ||
        a.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = {
      'BOISSON_CHAUDE': '☕', 'BOISSON_FROIDE': '🧃',
      'NOURRITURE': '🥪', 'DESSERT': '🍰', 'AUTRE': '📦'
    };
    return icons[cat] || '🍽️';
  }

  addToCart(article: Article): void {
    if (article.stockDisponible === 0) return;
    const existing = this.cart.find(i => i.article.id === article.id);
    if (existing) {
      if (existing.quantite < article.stockDisponible) {
        existing.quantite++;
        existing.sousTotal = existing.quantite * article.prix;
      }
    } else {
      this.cart.push({ article, quantite: 1, sousTotal: article.prix });
    }
  }

  increaseQty(index: number): void {
    const item = this.cart[index];
    if (item.quantite < item.article.stockDisponible) {
      item.quantite++;
      item.sousTotal = item.quantite * item.article.prix;
    }
  }

  decreaseQty(index: number): void {
    if (this.cart[index].quantite > 1) {
      this.cart[index].quantite--;
      this.cart[index].sousTotal = this.cart[index].quantite * this.cart[index].article.prix;
    } else {
      this.removeFromCart(index);
    }
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
  }

  clearCart(): void {
    this.cart = [];
    this.montantRecu = 0;
    this.errorMsg = '';
    this.successMsg = '';
  }

  getTotal(): number {
    return this.cart.reduce((sum, i) => sum + i.sousTotal, 0);
  }

  getMonnaie(): number {
    return this.montantRecu - this.getTotal();
  }

  calcMonnaie(): void {}

  getCartQty(article: Article): number {
    return this.cart.find(i => i.article.id === article.id)?.quantite || 0;
  }

  validerCommande(): void {
    if (this.cart.length === 0) return;
    if (this.montantRecu < this.getTotal()) {
      this.errorMsg = 'Montant reçu insuffisant!';
      return;
    }
    this.loading = true;
    this.errorMsg = '';

    const req: CommandeRequest = {
      numeroTable: this.numeroTable,
      lignes: this.cart.map(i => ({ articleId: i.article.id!, quantite: i.quantite })),
      montantRecu: this.montantRecu
    };

    this.apiService.createCommande(req).subscribe({
      next: (commande) => {
        this.loading = false;
        this.lastCommande = commande;
        this.showReceipt = true;
        this.clearCart();
        this.loadArticles();
        this.successMsg = 'Commande validée avec succès!';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error || 'Erreur lors de la validation.';
      }
    });
  }

  closeReceipt(): void {
    this.showReceipt = false;
    this.lastCommande = null;
  }

  printReceipt(): void {
    window.print();
  }
}

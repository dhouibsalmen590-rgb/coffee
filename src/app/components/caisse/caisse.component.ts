import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CommandeEventService } from '../../services/commande-event.service';
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
          <div class="page-title" style="display: flex; align-items: center; gap: 10px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <line x1="12" y1="10" x2="12" y2="18" />
              <line x1="8" y1="14" x2="16" y2="14" />
            </svg>
            Caisse & POS
          </div>
          <div class="page-subtitle">{{ now | date:'EEEE dd/MM/yyyy • HH:mm' }}</div>
        </div>
        <div style="display:flex; gap: 14px; align-items: center;">
          <div class="table-selector">
            <span class="selector-lbl">Table:</span>
            <select [(ngModel)]="numeroTable" class="form-control table-select-input">
              <option *ngFor="let t of tables" [value]="t">{{ t }}</option>
            </select>
          </div>
          <span class="badge badge-primary user-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="margin-right: 4px;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            {{ currentUserName }}
          </span>
        </div>
      </div>

      <div class="page-body">
        <div class="caisse-layout animate-in">

          <!-- LEFT: MENU ARTICLES -->
          <div class="menu-panel">
            <div class="menu-search-wrap">
              <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input
                type="text"
                class="form-control search-input"
                [(ngModel)]="searchTerm"
                (ngModelChange)="updateFilteredArticles()"
                placeholder="Rechercher un article..."
              />
            </div>

            <!-- Category Filters -->
            <div class="cat-filters">
              <button
                *ngFor="let cat of categories"
                class="cat-btn"
                [class.active]="selectedCat === cat.value"
                (click)="setCategory(cat.value)"
              >
                <span class="cat-icon">{{ cat.icon }}</span>
                <span>{{ cat.label }}</span>
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
                  <div class="article-icon-bg">
                    <span class="article-icon">{{ getCategoryIcon(article.categorie) }}</span>
                  </div>
                  <span class="article-qty-badge" *ngIf="cartQtyMap[article.id!] > 0">{{ cartQtyMap[article.id!] }}</span>
                </div>
                <div class="article-details">
                  <div class="article-name">{{ article.nom }}</div>
                  <div class="article-price">{{ article.prix | number:'1.3-3' }} DT</div>
                </div>
                <div class="article-stock-pill" [class.low]="article.stockDisponible <= article.stockMinimum">
                  Stock: {{ article.stockDisponible }}
                </div>
                <div *ngIf="article.stockDisponible === 0" class="out-of-stock-overlay">Rupture</div>
              </div>
            </div>
          </div>

          <!-- RIGHT: CART & PAYMENT -->
          <div class="cart-panel">
            <div class="cart-header">
              <h3>Table {{ numeroTable }}</h3>
              <button class="btn btn-sm btn-outline clear-btn" (click)="clearCart()" [disabled]="cart.length === 0">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                Vider
              </button>
            </div>

            <!-- Cart Items -->
            <div class="cart-items">
              <div *ngIf="cart.length === 0" class="cart-empty">
                <div class="cart-empty-icon">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                </div>
                <p>Aucun article sélectionné</p>
              </div>

              <div *ngFor="let item of cart; let i = index" class="cart-item">
                <div class="cart-item-info">
                  <span class="cart-item-name">{{ item.article.nom }}</span>
                  <span class="cart-item-price">{{ item.article.prix | number:'1.3-3' }} DT</span>
                </div>
                <div class="cart-item-controls">
                  <div class="qty-control-group">
                    <button class="qty-btn" (click)="decreaseQty(i)">−</button>
                    <span class="qty-val">{{ item.quantite }}</span>
                    <button class="qty-btn" (click)="increaseQty(i)" [disabled]="item.quantite >= item.article.stockDisponible">+</button>
                  </div>
                  <span class="cart-subtotal">{{ item.sousTotal | number:'1.3-3' }} DT</span>
                  <button class="remove-item-btn" (click)="removeFromCart(i)">✕</button>
                </div>
              </div>
            </div>

            <!-- TOTAL -->
            <div class="cart-total-section">
              <div class="total-row">
                <span>Sous-total</span>
                <span>{{ totalCart | number:'1.3-3' }} DT</span>
              </div>
              <div class="total-row total-main">
                <span>TOTAL</span>
                <strong>{{ totalCart | number:'1.3-3' }} DT</strong>
              </div>
            </div>

            <!-- PAYMENT -->
            <div class="payment-section">
              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label">Montant Reçu (DT)</label>
                <input
                  type="number"
                  class="form-control payment-input"
                  [(ngModel)]="montantRecu"
                  [min]="totalCart"
                  step="0.500"
                  placeholder="0.000"
                  (ngModelChange)="calcMonnaie()"
                />
              </div>

              <div class="monnaie-display" *ngIf="montantRecu > 0">
                <span>Rendre:</span>
                <strong [class.negative]="monnaie < 0">{{ monnaie | number:'1.3-3' }} DT</strong>
              </div>

              <div *ngIf="errorMsg" class="alert alert-danger" style="padding: 10px; font-size: 0.8rem; margin-bottom: 12px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                {{ errorMsg }}
              </div>
              <div *ngIf="successMsg" class="alert alert-success" style="padding: 10px; font-size: 0.8rem; margin-bottom: 12px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                {{ successMsg }}
              </div>

              <button
                class="btn btn-success btn-lg submit-payment-btn"
                (click)="validerCommande()"
                [disabled]="cart.length === 0 || montantRecu < totalCart || loading"
              >
                <span *ngIf="loading" class="btn-spinner-wrap">
                  <span class="spinner"></span>
                  Validation...
                </span>
                <span *ngIf="!loading" style="display:flex; align-items:center; gap:8px;">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                  Confirmer encaissement
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- RECEIPT MODAL -->
      <div class="modal-overlay" *ngIf="showReceipt" (click)="closeReceipt()">
        <div class="modal" (click)="$event.stopPropagation()" style="max-width: 360px; padding: 20px;">
          <div class="modal-header" style="margin-bottom: 14px; padding-bottom: 10px;">
            <span class="modal-title" style="font-size: 0.95rem;">Reçu Client</span>
            <button class="modal-close" (click)="closeReceipt()">✕</button>
          </div>
          <div class="ticket" *ngIf="lastCommande" style="padding: 10px; border-radius: 6px;">
            <div class="ticket-header">
              <div style="font-size: 1.1rem; font-weight: 800; letter-spacing: 0.5px;">☕ CAFÉ MANAGER</div>
              <div style="font-size:0.75rem; color: #555; margin-top:2px;">Reçu de transaction</div>
              <div style="border-top:1px dashed #ddd; margin: 10px 0;"></div>
              <div style="text-align: left; font-size: 0.78rem; line-height: 1.4; color: #333;">
                <div>N° Commande: #{{ lastCommande.id }}</div>
                <div>Date: {{ lastCommande.dateHeure | date:'dd/MM/yyyy HH:mm' }}</div>
                <div>Emplacement: Table N° {{ lastCommande.numeroTable }}</div>
                <div>Opérateur: {{ lastCommande.caissier?.fullName }}</div>
              </div>
              <div style="border-top:1px dashed #ddd; margin: 10px 0;"></div>
            </div>
            <div style="min-height: 60px;">
              <div *ngFor="let ligne of lastCommande.lignes" class="ticket-row" style="font-size: 0.78rem; padding: 3px 0; color: #111;">
                <span>{{ ligne.article.nom }} (x{{ ligne.quantite }})</span>
                <span>{{ ligne.sousTotal | number:'1.3-3' }} DT</span>
              </div>
            </div>
            <div style="border-top:1px dashed #ddd; margin: 10px 0;"></div>
            <div class="ticket-row ticket-total" style="font-size: 0.92rem; padding-top: 4px; color: #000;">
              <span>Net à payer</span>
              <span>{{ lastCommande.montantTotal | number:'1.3-3' }} DT</span>
            </div>
            <div class="ticket-row" style="font-size: 0.78rem; padding: 2px 0; color: #444;">
              <span>Espèces reçu</span>
              <span>{{ lastCommande.montantRecu | number:'1.3-3' }} DT</span>
            </div>
            <div class="ticket-row" style="font-size: 0.82rem; font-weight: 700; color: #2d8a50; padding: 2px 0;">
              <span>Rendu</span>
              <span>{{ lastCommande.monnaieRendue | number:'1.3-3' }} DT</span>
            </div>
            <div style="text-align: center; margin-top: 14px; border-top: 1px dashed #ddd; padding-top: 10px; font-size: 0.75rem; color: #666;">
              Merci pour votre visite! A bientôt 👋
            </div>
          </div>
          <div style="display: flex; gap: 10px; margin-top: 16px;">
            <button class="btn btn-primary btn-sm" style="flex: 1; justify-content: center;" (click)="printReceipt()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              Imprimer
            </button>
            <button class="btn btn-outline btn-sm" style="flex: 1; justify-content: center;" (click)="closeReceipt()">Fermer</button>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .caisse-layout {
      display: grid;
      grid-template-columns: 1fr 390px;
      gap: 22px;
      height: calc(100vh - 150px);
    }

    .menu-panel {
      display: flex;
      flex-direction: column;
      gap: 16px;
      overflow: hidden;
    }

    .menu-search-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }
    .menu-search-wrap .search-icon {
      position: absolute;
      left: 14px;
      color: var(--text-muted);
      pointer-events: none;
    }
    .search-input {
      padding-left: 40px !important;
    }

    .cat-filters {
      display: flex;
      gap: 8px;
      overflow-x: auto;
      padding-bottom: 4px;
      scrollbar-width: none;
    }
    .cat-filters::-webkit-scrollbar { display: none; }

    .cat-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      border-radius: 20px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,0.02);
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      transition: all var(--transition);
      white-space: nowrap;
    }

    .cat-btn.active, .cat-btn:hover {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
      box-shadow: 0 4px 12px rgba(200, 135, 58, 0.25);
    }

    .articles-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
      gap: 12px;
      overflow-y: auto;
      flex: 1;
      padding-right: 4px;
    }

    .article-card {
      background: linear-gradient(145deg, var(--bg-card) 0%, var(--bg-card2) 100%);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px 12px 14px;
      cursor: pointer;
      transition: all var(--transition);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 10px;
      min-height: 140px;
      justify-content: space-between;
    }

    .article-card:hover {
      border-color: var(--border-hover);
      transform: translateY(-3px);
      box-shadow: var(--glow), var(--shadow);
    }

    .article-card:active {
      transform: translateY(-1px) scale(0.98);
    }

    .article-card.out-of-stock {
      opacity: 0.35;
      cursor: not-allowed;
    }

    .article-icon-wrap {
      position: relative;
      display: inline-flex;
    }

    .article-icon-bg {
      width: 48px; height: 48px;
      background: rgba(200,135,58,0.06);
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      border: 1px solid rgba(200,135,58,0.12);
      transition: background var(--transition);
    }
    .article-card:hover .article-icon-bg {
      background: rgba(200,135,58,0.15);
    }

    .article-icon {
      font-size: 1.5rem;
    }

    .article-qty-badge {
      position: absolute;
      top: -3px;
      right: -6px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      font-size: 0.65rem;
      font-weight: 800;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 1.5px solid var(--bg-dark);
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    }

    .article-details {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .article-name {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.25;
      max-width: 100%;
    }

    .article-price {
      font-size: 0.82rem;
      font-weight: 800;
      color: var(--primary-light);
    }

    .article-stock-pill {
      font-size: 0.65rem;
      color: var(--text-muted);
      background: rgba(255,255,255,0.03);
      padding: 2px 8px;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.05);
    }

    .article-stock-pill.low {
      color: var(--warning);
      background: rgba(240,192,64,0.05);
      border-color: rgba(240,192,64,0.12);
    }

    .out-of-stock-overlay {
      position: absolute;
      inset: 0;
      background: rgba(12,9,5,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 700;
      color: #ef4444;
      letter-spacing: 0.8px;
      text-transform: uppercase;
    }

    /* CART */
    .cart-panel {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: var(--shadow-sm);
    }

    .cart-header {
      padding: 16px 20px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--bg-card2);
    }

    .cart-header h3 {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .clear-btn {
      padding: 5px 10px !important;
      font-size: 0.75rem !important;
      border-radius: 6px;
    }

    .cart-items {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
    }

    .cart-empty {
      text-align: center;
      padding: 50px 20px;
      color: var(--text-muted);
    }
    .cart-empty-icon {
      font-size: 2.2rem;
      margin-bottom: 10px;
      opacity: 0.3;
    }
    .cart-empty p {
      font-size: 0.8rem;
    }

    .cart-item {
      padding: 12px;
      background: rgba(255,255,255,0.015);
      border-radius: var(--radius-sm);
      margin-bottom: 8px;
      border: 1px solid var(--border);
      transition: all var(--transition);
    }
    .cart-item:hover {
      border-color: rgba(200,135,58,0.25);
      background: rgba(255,255,255,0.025);
    }

    .cart-item-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }

    .cart-item-name {
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .cart-item-price {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .cart-item-controls {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .qty-control-group {
      display: flex;
      align-items: center;
      background: rgba(0,0,0,0.2);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 2px;
    }

    .qty-btn {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      border: none;
      background: transparent;
      color: var(--text-secondary);
      font-size: 1rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all var(--transition);
    }

    .qty-btn:hover:not(:disabled) {
      background: rgba(255,255,255,0.08);
      color: var(--text-primary);
    }
    .qty-btn:disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }

    .qty-val {
      font-size: 0.82rem;
      font-weight: 700;
      min-width: 26px;
      text-align: center;
      color: var(--text-primary);
    }

    .cart-subtotal {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--primary-light);
    }

    .remove-item-btn {
      background: none; border: none;
      color: var(--text-muted); cursor: pointer;
      font-size: 0.82rem; padding: 4px;
      transition: color var(--transition);
    }
    .remove-item-btn:hover {
      color: #ef4444;
    }

    .cart-total-section {
      padding: 14px 20px;
      border-top: 1px solid var(--border);
      background: rgba(200, 135, 58, 0.04);
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-secondary);
      padding: 3px 0;
    }

    .total-row.total-main {
      font-size: 1.15rem;
      color: var(--text-primary);
      margin-top: 6px;
      padding-top: 6px;
      border-top: 1px solid var(--border);
    }

    .payment-section {
      padding: 16px 20px;
      border-top: 1px solid var(--border);
    }

    .payment-input {
      font-size: 1.1rem !important;
      font-weight: 700;
      text-align: right;
      color: var(--primary-light) !important;
      background: rgba(0,0,0,0.15) !important;
    }

    .monnaie-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 14px;
      background: rgba(63, 176, 106, 0.08);
      border: 1px solid rgba(63, 176, 106, 0.2);
      border-radius: var(--radius-sm);
      margin-bottom: 14px;
      font-size: 0.84rem;
      color: var(--text-secondary);
    }

    .monnaie-display strong {
      font-size: 1.15rem;
      color: #3fb06a;
    }

    .monnaie-display strong.negative {
      color: var(--danger);
    }

    .submit-payment-btn {
      width: 100%;
      justify-content: center;
      padding: 12px !important;
    }

    .table-selector {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .selector-lbl {
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .table-select-input {
      width: 76px !important;
      padding: 5px 10px !important;
      font-size: 0.84rem !important;
      background: rgba(0,0,0,0.15) !important;
      border-radius: 8px !important;
    }
    .user-badge {
      display: inline-flex;
      align-items: center;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.78rem;
    }
  `]
})
export class CaisseComponent implements OnInit {
  articles: Article[] = [];
  filteredArticles: Article[] = [];
  cart: CartItem[] = [];
  cartQtyMap: Record<number, number> = {};
  totalCart = 0;
  monnaie = 0;
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

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private commandeEventService: CommandeEventService
  ) {}

  ngOnInit(): void {
    this.loadArticles();
    const user = this.authService.getCurrentUser();
    this.currentUserName = user?.fullName || '';
    setInterval(() => { this.now = new Date(); }, 30000);
  }

  loadArticles(): void {
    this.apiService.getArticles().subscribe(a => {
      this.articles = a;
      this.updateFilteredArticles();
    });
  }

  updateFilteredArticles(): void {
    this.filteredArticles = this.articles.filter(a => {
      const matchCat = this.selectedCat === 'ALL' || a.categorie === this.selectedCat;
      const matchSearch = !this.searchTerm ||
        a.nom.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }

  setCategory(cat: string): void {
    this.selectedCat = cat;
    this.updateFilteredArticles();
  }

  getCategoryIcon(cat: string): string {
    const icons: Record<string, string> = {
      'BOISSON_CHAUDE': '☕', 'BOISSON_FROIDE': '🧃',
      'NOURRITURE': '🥪', 'DESSERT': '🍰', 'AUTRE': '📦'
    };
    return icons[cat] || '🍽️';
  }

  updateCartTotalsAndQty(): void {
    this.totalCart = this.cart.reduce((sum, i) => sum + i.sousTotal, 0);
    this.monnaie = this.montantRecu - this.totalCart;

    this.cartQtyMap = {};
    for (const item of this.cart) {
      if (item.article.id) {
        this.cartQtyMap[item.article.id] = item.quantite;
      }
    }
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
    this.updateCartTotalsAndQty();
  }

  increaseQty(index: number): void {
    const item = this.cart[index];
    if (item.quantite < item.article.stockDisponible) {
      item.quantite++;
      item.sousTotal = item.quantite * item.article.prix;
    }
    this.updateCartTotalsAndQty();
  }

  decreaseQty(index: number): void {
    if (this.cart[index].quantite > 1) {
      this.cart[index].quantite--;
      this.cart[index].sousTotal = this.cart[index].quantite * this.cart[index].article.prix;
    } else {
      this.cart.splice(index, 1);
    }
    this.updateCartTotalsAndQty();
  }

  removeFromCart(index: number): void {
    this.cart.splice(index, 1);
    this.updateCartTotalsAndQty();
  }

  clearCart(): void {
    this.cart = [];
    this.montantRecu = 0;
    this.errorMsg = '';
    this.successMsg = '';
    this.updateCartTotalsAndQty();
  }

  calcMonnaie(): void {
    this.monnaie = this.montantRecu - this.totalCart;
  }

  validerCommande(): void {
    if (this.cart.length === 0) return;
    if (this.montantRecu < this.totalCart) {
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
        // Notifier tous les composants (Dashboard, Historique) qu'une nouvelle commande existe
        this.commandeEventService.emitNouvelleCommande(commande);
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

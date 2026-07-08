import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../layout/layout.component';
import { ApiService } from '../../services/api.service';
import { CommandeEventService } from '../../services/commande-event.service';
import { Commande } from '../../models/models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-historique',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="page-header">
        <div>
          <div class="page-title" style="display:flex;align-items:center;gap:10px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            Historique des Commandes
          </div>
          <div class="page-subtitle">Toutes les commandes enregistrées — {{ commandes.length }} au total</div>
        </div>
        <div style="display:flex;align-items:center;gap:10px;">
          <span *ngIf="newOrderFlash" class="new-order-badge">
            Nouvelle commande ajoutée!
          </span>
          <button class="btn btn-outline btn-sm" (click)="loadCommandes()">Actualiser</button>
        </div>
      </div>

      <div class="page-body">

        <!-- STATS -->
        <div class="grid grid-4 animate-in" style="margin-bottom:24px;">
          <div class="stat-card success">
            <div class="stat-label">Commandes Payées</div>
            <div class="stat-value">{{ nbPayees }}</div>
            <div class="stat-icon" style="color:var(--success);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
          <div class="stat-card warning">
            <div class="stat-label">En Cours</div>
            <div class="stat-value">{{ nbEnCours }}</div>
            <div class="stat-icon" style="color:var(--warning);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
          </div>
          <div class="stat-card danger">
            <div class="stat-label">Annulées</div>
            <div class="stat-value">{{ nbAnnulees }}</div>
            <div class="stat-icon" style="color:var(--danger);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </div>
          </div>
          <div class="stat-card primary">
            <div class="stat-label">Recette Totale</div>
            <div class="stat-value" style="font-size:1.3rem;">{{ recetteTotal | number:'1.3-3' }} DT</div>
            <div class="stat-icon" style="color:var(--primary);">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
          </div>
        </div>

        <!-- FILTERS -->
        <div class="animate-in" style="display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap;">
          <select class="form-control" [(ngModel)]="filterStatut" style="max-width:180px;">
            <option value="">Tous les statuts</option>
            <option value="PAYEE">Payée</option>
            <option value="EN_COURS">En cours</option>
            <option value="ANNULEE">Annulée</option>
          </select>
          <input type="date" class="form-control" [(ngModel)]="filterDate" style="max-width:160px;" />
          <input type="number" class="form-control" [(ngModel)]="filterTable" placeholder="N° Table" style="max-width:130px;" min="1" />
          <button class="btn btn-outline btn-sm" (click)="clearFilters()">Réinitialiser</button>
        </div>

        <div class="card animate-in" style="padding:0;">
          <div class="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th style="width:36px;"></th>
                  <th>N°</th>
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
                  <td colspan="11" style="text-align:center;padding:40px;color:var(--text-muted);">
                    Aucune commande trouvée.
                  </td>
                </tr>
                <ng-container *ngFor="let cmd of filteredCommandes">
                  <!-- Ligne principale -->
                  <tr [class.expanded-row]="expandedId === cmd.id" (click)="toggleExpand(cmd.id!)" class="main-row">
                    <td>
                      <span class="expand-icon" [class.rotated]="expandedId === cmd.id">›</span>
                    </td>
                    <td><strong style="color:var(--primary-light);">#{{ cmd.id }}</strong></td>
                    <td>Table {{ cmd.numeroTable }}</td>
                    <td>
                      <div>{{ cmd.dateHeure | date:'dd/MM/yyyy' }}</div>
                      <div style="font-size:0.75rem;color:var(--text-muted);">{{ cmd.dateHeure | date:'HH:mm:ss' }}</div>
                    </td>
                    <td>{{ cmd.caissier?.fullName || '—' }}</td>
                    <td>
                      <div class="articles-summary">
                        <span *ngFor="let l of cmd.lignes; let last = last" style="font-size:0.78rem;color:var(--text-secondary);">
                          {{ l.article.nom }} ×{{ l.quantite }}<span *ngIf="!last">, </span>
                        </span>
                      </div>
                    </td>
                    <td><strong>{{ cmd.montantTotal | number:'1.3-3' }} DT</strong></td>
                    <td style="color:var(--primary-light);">{{ cmd.montantRecu | number:'1.3-3' }} DT</td>
                    <td [style.color]="(cmd.monnaieRendue||0)>=0?'var(--success)':'var(--danger)'">
                      <strong>{{ cmd.monnaieRendue | number:'1.3-3' }} DT</strong>
                    </td>
                    <td>
                      <span class="badge" [ngClass]="getStatutBadge(cmd.statut)">{{ getStatutLabel(cmd.statut) }}</span>
                    </td>
                    <td (click)="$event.stopPropagation()">
                      <button *ngIf="cmd.statut === 'EN_COURS'" class="btn-action-sm" (click)="annulerCommande(cmd)" title="Annuler">✕</button>
                    </td>
                  </tr>

                  <!-- Ligne de détail expandable -->
                  <tr *ngIf="expandedId === cmd.id" class="detail-tr">
                    <td colspan="11" style="padding:0;border-bottom:2px solid rgba(200,135,58,0.18);">
                      <div class="detail-panel">
                        <div class="detail-grid">

                          <!-- Colonne articles -->
                          <div>
                            <div class="detail-title">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                              Articles commandés
                            </div>
                            <div class="art-list">
                              <div *ngFor="let l of cmd.lignes" class="art-row">
                                <span class="art-name">{{ l.article.nom }}</span>
                                <span class="art-qty">× {{ l.quantite }}</span>
                                <span class="art-price">{{ l.sousTotal | number:'1.3-3' }} DT</span>
                              </div>
                            </div>
                          </div>

                          <!-- Colonne paiement -->
                          <div>
                            <div class="detail-title">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                              Détails du paiement
                            </div>
                            <div class="pay-list">
                              <div class="pay-row">
                                <span>Montant de la commande</span>
                                <strong>{{ cmd.montantTotal | number:'1.3-3' }} DT</strong>
                              </div>
                              <div class="pay-row">
                                <span>Montant donné par le client</span>
                                <strong style="color:var(--primary-light);">{{ cmd.montantRecu | number:'1.3-3' }} DT</strong>
                              </div>
                              <div class="pay-row pay-row-highlight">
                                <span>Monnaie rendue</span>
                                <strong [style.color]="(cmd.monnaieRendue||0)>=0?'var(--success)':'var(--danger)'">
                                  {{ cmd.monnaieRendue | number:'1.3-3' }} DT
                                </strong>
                              </div>
                              <div class="pay-row pay-row-profit" *ngIf="cmd.statut==='PAYEE'">
                                <span>Recette de cette commande</span>
                                <strong style="color:var(--success);">+ {{ cmd.montantTotal | number:'1.3-3' }} DT</strong>
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </td>
                  </tr>
                </ng-container>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </app-layout>
  `,
  styles: [`
    .new-order-badge {
      display:inline-flex; align-items:center; gap:6px;
      padding:5px 12px; border-radius:20px;
      background:rgba(63,176,106,0.12); color:var(--success);
      border:1px solid rgba(63,176,106,0.3);
      font-size:0.78rem; font-weight:600;
      animation: badgePulse 1.5s ease infinite;
    }
    @keyframes badgePulse { 0%,100%{opacity:1} 50%{opacity:0.55} }

    .main-row { cursor:pointer; }
    .main-row:hover td { background:rgba(200,135,58,0.04) !important; }
    .expanded-row td { background:rgba(200,135,58,0.06) !important; }

    .expand-icon {
      display:inline-block; font-size:1.2rem; font-weight:700;
      color:var(--text-muted); transition:transform 0.2s, color 0.2s;
      line-height:1;
    }
    .expand-icon.rotated { transform:rotate(90deg); color:var(--primary-light); }

    .articles-summary {
      max-width:220px; overflow:hidden;
      text-overflow:ellipsis; white-space:nowrap;
    }

    .btn-action-sm {
      width:26px; height:26px; border-radius:6px;
      display:flex; align-items:center; justify-content:center;
      border:1px solid rgba(224,82,82,0.3); background:rgba(224,82,82,0.08);
      color:#e05252; cursor:pointer; font-size:0.8rem;
      transition:all var(--transition);
    }
    .btn-action-sm:hover { background:rgba(224,82,82,0.2); }

    .detail-tr:hover td { background:transparent !important; }

    .detail-panel {
      padding:18px 24px 22px;
      background:rgba(0,0,0,0.2);
      border-top:1px solid rgba(200,135,58,0.12);
      animation:expandIn 0.22s ease;
    }
    @keyframes expandIn { from{opacity:0;transform:translateY(-5px)} to{opacity:1;transform:translateY(0)} }

    .detail-grid { display:grid; grid-template-columns:1fr 300px; gap:24px; }

    .detail-title {
      display:flex; align-items:center; gap:7px;
      font-size:0.7rem; font-weight:700; text-transform:uppercase;
      letter-spacing:0.9px; color:var(--text-muted); margin-bottom:10px;
    }

    .art-list { display:flex; flex-direction:column; gap:5px; }
    .art-row {
      display:flex; align-items:center; gap:10px;
      padding:7px 12px; border-radius:8px;
      background:rgba(255,255,255,0.02);
      border:1px solid rgba(255,255,255,0.04);
    }
    .art-name { flex:1; font-size:0.83rem; font-weight:500; color:var(--text-primary); }
    .art-qty  { font-size:0.78rem; color:var(--text-muted); min-width:36px; text-align:center; }
    .art-price{ font-size:0.84rem; font-weight:700; color:var(--primary-light); min-width:80px; text-align:right; }

    .pay-list { display:flex; flex-direction:column; gap:3px; }
    .pay-row {
      display:flex; justify-content:space-between; align-items:center;
      padding:7px 10px; border-radius:7px;
      font-size:0.82rem; color:var(--text-secondary);
    }
    .pay-row-highlight {
      background:rgba(200,135,58,0.06);
      border:1px solid rgba(200,135,58,0.1);
      margin-top:4px;
    }
    .pay-row-profit {
      background:rgba(63,176,106,0.07);
      border:1px solid rgba(63,176,106,0.15);
      margin-top:4px;
    }
  `]
})
export class HistoriqueComponent implements OnInit, OnDestroy {
  commandes: Commande[] = [];
  expandedId: number | null = null;
  newOrderFlash = false;

  filterStatut = '';
  filterDate = '';
  filterTable: number | null = null;

  nbPayees = 0;
  nbEnCours = 0;
  nbAnnulees = 0;
  recetteTotal = 0;

  private sub = new Subscription();

  constructor(
    private apiService: ApiService,
    private commandeEventService: CommandeEventService
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
    // S'abonner : ReplaySubject(1) émet même si l'on arrive après la création
    this.sub.add(
      this.commandeEventService.onNouvelleCommande().subscribe(cmd => {
        // hadEmission() évite de traiter un replay "vide" au premier démarrage
        if (!this.commandeEventService.hadEmission()) return;
        // Éviter un doublon si la commande existe déjà (navigation aller-retour)
        const exists = this.commandes.some(c => c.id === cmd.id);
        if (!exists) {
          this.commandes = [cmd, ...this.commandes];
          this.updateStats();
        }
        this.expandedId = cmd.id!;
        this.newOrderFlash = true;
        setTimeout(() => this.newOrderFlash = false, 4000);
        // Reset pour que la prochaine visite de Historique ne rejoue pas cet événement
        this.commandeEventService.reset();
      })
    );
  }

  ngOnDestroy(): void { this.sub.unsubscribe(); }

  loadCommandes(): void {
    this.apiService.getCommandes().subscribe({
      next: (c) => {
        this.commandes = [...c].reverse();
        this.updateStats();
      },
      error: (err) => console.error('Erreur chargement commandes:', err)
    });
  }

  // Getter calculé — Angular le réévalue à chaque changement détecté
  get filteredCommandes(): Commande[] {
    return this.commandes.filter(c => {
      const matchStatut = !this.filterStatut || c.statut === this.filterStatut;
      const matchDate   = !this.filterDate   || (!!c.dateHeure && c.dateHeure.startsWith(this.filterDate));
      const matchTable  = !this.filterTable  || c.numeroTable === Number(this.filterTable);
      return matchStatut && matchDate && matchTable;
    });
  }

  updateStats(): void {
    this.nbPayees   = this.commandes.filter(c => c.statut === 'PAYEE').length;
    this.nbEnCours  = this.commandes.filter(c => c.statut === 'EN_COURS').length;
    this.nbAnnulees = this.commandes.filter(c => c.statut === 'ANNULEE').length;
    this.recetteTotal = this.commandes
      .filter(c => c.statut === 'PAYEE')
      .reduce((s, c) => s + (c.montantTotal || 0), 0);
  }

  toggleExpand(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  clearFilters(): void {
    this.filterStatut = '';
    this.filterDate = '';
    this.filterTable = null;
  }

  getStatutBadge(statut?: string): string {
    switch (statut) {
      case 'PAYEE':    return 'badge-success';
      case 'EN_COURS': return 'badge-warning';
      case 'ANNULEE':  return 'badge-danger';
      default:         return 'badge-primary';
    }
  }

  getStatutLabel(statut?: string): string {
    switch (statut) {
      case 'PAYEE':    return 'Payée';
      case 'EN_COURS': return 'En cours';
      case 'ANNULEE':  return 'Annulée';
      default:         return statut || '';
    }
  }

  annulerCommande(cmd: Commande): void {
    if (confirm(`Annuler la commande #${cmd.id}?`)) {
      this.apiService.annulerCommande(cmd.id!).subscribe(() => this.loadCommandes());
    }
  }
}

import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { Commande } from '../models/models';

/**
 * Service partagé pour notifier les composants (Dashboard, Historique)
 * qu'une nouvelle commande vient d'être validée en caisse.
 * ReplaySubject(1) garantit que même si Historique est monté APRÈS l'émission,
 * il reçoit quand même la dernière commande créée.
 */
@Injectable({ providedIn: 'root' })
export class CommandeEventService {
  private nouvelleCommande$ = new ReplaySubject<Commande>(1);
  private hasEmitted = false;

  /** Émet une commande dès qu'elle est créée en caisse. */
  emitNouvelleCommande(commande: Commande): void {
    this.hasEmitted = true;
    this.nouvelleCommande$.next(commande);
  }

  /** S'abonner aux nouvelles commandes. */
  onNouvelleCommande() {
    return this.nouvelleCommande$.asObservable();
  }

  /** Vérifie si une commande a déjà été émise (pour éviter les faux positifs au démarrage). */
  hadEmission(): boolean {
    return this.hasEmitted;
  }

  /** Reset après que l'Historique a consommé l'événement. */
  reset(): void {
    this.hasEmitted = false;
    this.nouvelleCommande$ = new ReplaySubject<Commande>(1);
  }
}

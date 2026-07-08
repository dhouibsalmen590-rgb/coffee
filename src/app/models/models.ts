export interface User {
  id?: number;
  username: string;
  fullName: string;
  role: 'ADMIN' | 'CAISSIER';
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  fullName: string;
  role: string;
}

export interface Article {
  id?: number;
  nom: string;
  description?: string;
  prix: number;
  categorie: 'BOISSON_CHAUDE' | 'BOISSON_FROIDE' | 'NOURRITURE' | 'DESSERT' | 'AUTRE';
  stockDisponible: number;
  stockMinimum: number;
  imageUrl?: string;
  actif: boolean;
}

export interface LigneCommande {
  id?: number;
  article: Article;
  quantite: number;
  prixUnitaire: number;
  sousTotal: number;
}

export interface Commande {
  id?: number;
  numeroTable: number;
  dateHeure?: string;
  caissier?: User;
  lignes: LigneCommande[];
  montantTotal?: number;
  montantRecu?: number;
  monnaieRendue?: number;
  statut?: 'EN_COURS' | 'PAYEE' | 'ANNULEE';
}

export interface CommandeRequest {
  numeroTable: number;
  lignes: { articleId: number; quantite: number }[];
  montantRecu?: number;
}

export interface Depense {
  id?: number;
  description: string;
  montant: number;
  date: string;
  categorie: 'ACHAT_STOCK' | 'LOYER' | 'SALAIRES' | 'ELECTRICITE' | 'EAU' | 'ENTRETIEN' | 'AUTRE';
  creePar?: User;
}

export interface DashboardStats {
  recetteTotaleJour: number;
  recetteTotaleMois: number;
  nombreCommandesJour: number;
  depensesTotalesMois: number;
  beneficeNetMois: number;
  articlesStockFaible: number;
}

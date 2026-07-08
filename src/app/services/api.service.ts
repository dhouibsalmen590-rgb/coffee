import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article, Commande, CommandeRequest, Depense, DashboardStats } from '../models/models';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private baseUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // Articles
  getArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/articles`);
  }

  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/articles/all`);
  }

  createArticle(article: Article): Observable<Article> {
    return this.http.post<Article>(`${this.baseUrl}/articles`, article);
  }

  updateArticle(id: number, article: Article): Observable<Article> {
    return this.http.put<Article>(`${this.baseUrl}/articles/${id}`, article);
  }

  updateStock(id: number, quantite: number): Observable<Article> {
    return this.http.put<Article>(`${this.baseUrl}/articles/${id}/stock?quantite=${quantite}`, {});
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/articles/${id}`);
  }

  getStockFaible(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/articles/stock-faible`);
  }

  // Commandes
  getCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.baseUrl}/commandes`);
  }

  getCommandesEnCours(): Observable<Commande[]> {
    return this.http.get<Commande[]>(`${this.baseUrl}/commandes/en-cours`);
  }

  createCommande(req: CommandeRequest): Observable<Commande> {
    return this.http.post<Commande>(`${this.baseUrl}/commandes`, req);
  }

  payerCommande(id: number, montantRecu: number): Observable<Commande> {
    return this.http.put<Commande>(`${this.baseUrl}/commandes/${id}/payer?montantRecu=${montantRecu}`, {});
  }

  annulerCommande(id: number): Observable<Commande> {
    return this.http.put<Commande>(`${this.baseUrl}/commandes/${id}/annuler`, {});
  }

  // Depenses
  getDepenses(): Observable<Depense[]> {
    return this.http.get<Depense[]>(`${this.baseUrl}/depenses`);
  }

  createDepense(depense: Depense): Observable<Depense> {
    return this.http.post<Depense>(`${this.baseUrl}/depenses`, depense);
  }

  updateDepense(id: number, depense: Depense): Observable<Depense> {
    return this.http.put<Depense>(`${this.baseUrl}/depenses/${id}`, depense);
  }

  deleteDepense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/depenses/${id}`);
  }

  // Dashboard
  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/stats`);
  }
}

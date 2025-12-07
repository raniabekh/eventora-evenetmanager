// services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // URL de votre API Gateway Spring Cloud
  private gatewayUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  // Méthode générique pour POST
  post<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    const url = `${this.gatewayUrl}/${endpoint}`;
    console.log(`🌐 POST to Gateway: ${url}`, data);  // ✅ FIXED

    return this.http.post<T>(url, data, {
      headers: headers || this.getDefaultHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Méthode générique pour GET
  get<T>(endpoint: string, params?: any, headers?: HttpHeaders): Observable<T> {
    const url = `${this.gatewayUrl}/${endpoint}`;
    const options = {
      headers: headers || this.getDefaultHeaders(),
      params: this.createParams(params)
    };

    console.log(`🌐 GET from Gateway: ${url}`);  // ✅ FIXED

    return this.http.get<T>(url, options).pipe(
      catchError(this.handleError)
    );
  }

  // Méthode générique pour PUT
  put<T>(endpoint: string, data: any, headers?: HttpHeaders): Observable<T> {
    const url = `${this.gatewayUrl}/${endpoint}`;
    console.log(`🌐 PUT to Gateway: ${url}`, data);  // ✅ FIXED

    return this.http.put<T>(url, data, {
      headers: headers || this.getDefaultHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Méthode générique pour DELETE
  delete<T>(endpoint: string, headers?: HttpHeaders): Observable<T> {
    const url = `${this.gatewayUrl}/${endpoint}`;
    console.log(`🌐 DELETE from Gateway: ${url}`);  // ✅ FIXED

    return this.http.delete<T>(url, {
      headers: headers || this.getDefaultHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // Headers par défaut
  private getDefaultHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    // Ajouter le token JWT s'il existe
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Création des params pour GET
  private createParams(params: any): HttpParams {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return httpParams;
  }

  // Gestion d'erreur centralisée
  private handleError(error: any): Observable<never> {
    console.error('❌ Gateway Error:', error);

    let errorMessage = 'Une erreur est survenue avec le Gateway';

    if (error.status === 0) {
      errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion ou si le Gateway est démarré.';
    } else if (error.status === 401) {
      errorMessage = 'Non autorisé. Veuillez vous reconnecter.';
    } else if (error.status === 403) {
      errorMessage = 'Accès interdit.';
    } else if (error.status === 404) {
      errorMessage = 'Ressource non trouvée.';
    } else if (error.status === 500) {
      errorMessage = 'Erreur interne du serveur.';
    } else if (error.status === 502 || error.status === 503) {
      errorMessage = 'Service temporairement indisponible.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => ({
      message: errorMessage,
      status: error.status,
      error: error.error
    }));
  }
}

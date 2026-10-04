import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateVariantPayload, UpdateVariantPayload, Variant } from './variant.model';

@Injectable({ providedIn: 'root' })
export class VariantsService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/variants`;

  findAll(): Observable<Variant[]> {
    return this.http.get<Variant[]>(this.url);
  }

  findOne(id: number): Observable<Variant> {
    return this.http.get<Variant>(`${this.url}/${id}`);
  }

  create(payload: CreateVariantPayload): Observable<Variant> {
    return this.http.post<Variant>(this.url, payload);
  }

  update(id: number, payload: UpdateVariantPayload): Observable<Variant> {
    return this.http.patch<Variant>(`${this.url}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}

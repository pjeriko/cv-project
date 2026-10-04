import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Variant } from './variant.model';

@Injectable({ providedIn: 'root' })
export class VariantsService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<Variant[]> {
    return this.http.get<Variant[]>(`${environment.apiBaseUrl}/variants`);
  }
}

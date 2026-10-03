import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { VariantOption } from './skill.model';

@Injectable({ providedIn: 'root' })
export class VariantsService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<VariantOption[]> {
    return this.http.get<VariantOption[]>(`${environment.apiBaseUrl}/variants`);
  }
}

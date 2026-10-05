import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateExperiencePayload,
  ExperienceWithVariants,
  UpdateExperiencePayload,
} from './experience.model';

@Injectable({ providedIn: 'root' })
export class ExperiencesService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/experiences`;

  findAll(): Observable<ExperienceWithVariants[]> {
    return this.http.get<ExperienceWithVariants[]>(this.baseUrl);
  }

  findOne(id: number): Observable<ExperienceWithVariants> {
    return this.http.get<ExperienceWithVariants>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateExperiencePayload): Observable<ExperienceWithVariants> {
    return this.http.post<ExperienceWithVariants>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateExperiencePayload): Observable<ExperienceWithVariants> {
    return this.http.patch<ExperienceWithVariants>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

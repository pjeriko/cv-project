import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreateEducationPayload,
  EducationWithVariants,
  UpdateEducationPayload,
} from './education.model';

@Injectable({ providedIn: 'root' })
export class EducationsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/educations`;

  findAll(): Observable<EducationWithVariants[]> {
    return this.http.get<EducationWithVariants[]>(this.baseUrl);
  }

  findOne(id: number): Observable<EducationWithVariants> {
    return this.http.get<EducationWithVariants>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateEducationPayload): Observable<EducationWithVariants> {
    return this.http.post<EducationWithVariants>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateEducationPayload): Observable<EducationWithVariants> {
    return this.http.patch<EducationWithVariants>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateSkillPayload, SkillWithVariants } from './skill.model';

@Injectable({ providedIn: 'root' })
export class SkillsService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<SkillWithVariants[]> {
    return this.http.get<SkillWithVariants[]>(`${environment.apiBaseUrl}/skills`);
  }

  create(payload: CreateSkillPayload): Observable<SkillWithVariants> {
    return this.http.post<SkillWithVariants>(`${environment.apiBaseUrl}/skills`, payload);
  }
}

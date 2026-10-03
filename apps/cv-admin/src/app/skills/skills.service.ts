import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SkillWithVariants } from './skill.model';

@Injectable({ providedIn: 'root' })
export class SkillsService {
  private readonly http = inject(HttpClient);

  findAll(): Observable<SkillWithVariants[]> {
    return this.http.get<SkillWithVariants[]>(`${environment.apiBaseUrl}/skills`);
  }
}

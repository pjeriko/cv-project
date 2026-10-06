import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateProjectPayload, ProjectWithVariants, UpdateProjectPayload } from './project.model';

@Injectable({ providedIn: 'root' })
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/projects`;

  findAll(): Observable<ProjectWithVariants[]> {
    return this.http.get<ProjectWithVariants[]>(this.baseUrl);
  }

  findOne(id: number): Observable<ProjectWithVariants> {
    return this.http.get<ProjectWithVariants>(`${this.baseUrl}/${id}`);
  }

  create(payload: CreateProjectPayload): Observable<ProjectWithVariants> {
    return this.http.post<ProjectWithVariants>(this.baseUrl, payload);
  }

  update(id: number, payload: UpdateProjectPayload): Observable<ProjectWithVariants> {
    return this.http.patch<ProjectWithVariants>(`${this.baseUrl}/${id}`, payload);
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

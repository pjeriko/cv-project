import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CvResponse } from '@cv-project/shared-types';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CvService {
  constructor(private readonly http: HttpClient) {}

  getCvByVariant(slug: string): Observable<CvResponse> {
    return this.http.get<CvResponse>(`${environment.apiBaseUrl}/public/cv/${slug}`);
  }
}

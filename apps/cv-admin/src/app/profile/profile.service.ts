import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { Profile } from '@cv-project/shared-types';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UpdateProfilePayload } from './profile.model';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiBaseUrl}/profile`;

  find(): Observable<Profile> {
    return this.http.get<Profile>(this.url);
  }

  update(payload: UpdateProfilePayload): Observable<Profile> {
    return this.http.patch<Profile>(this.url, payload);
  }
}

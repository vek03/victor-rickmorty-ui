import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { RickMortyAPICharacterListResponse } from './dto/RickMortyAPICharacterListResponse';
import { Character } from '../../models/character.model';

@Injectable({ providedIn: 'root' })
export class RickMortyAPIService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getCharacters(filter?: Character, page?: number): Observable<RickMortyAPICharacterListResponse> {
    const params: any = {};

    if (filter) {
      const keys = Object.keys(filter) as Array<keyof Character>;

      keys.forEach(key => {
        const value = filter[key];
        if (value !== undefined && value !== null && value !== '') {
          params[key] = value;
        }
      });
    }

    if (page) {
      params['page'] = page;
    }

    return this.http.get<RickMortyAPICharacterListResponse>(`${this.baseUrl}/character/`, { params });
  }

  getMultipleCharacters(ids: number[]): Observable<Character[]> {
    const idsParam = ids.join(',');
    return this.http.get<Character[]>(`${this.baseUrl}/character/${idsParam}`);
  }

  getCharacterById(id: number): Observable<Character> {
    return this.http.get<Character>(`${this.baseUrl}/character/${id}`);
  }
}

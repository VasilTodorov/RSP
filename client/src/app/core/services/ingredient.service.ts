// src/app/core/services/ingredient.service.ts
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Ingredient } from '../models/ingredient.model';

@Injectable({ providedIn: 'root' })
export class IngredientService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/ingredient';

  searchIngredients(term: string) {
    // Backend should handle: GET /ingredients?name=tomato
    return this.http.get<Ingredient[]>(`${this.API_URL}?name=${term}`);
  }
}
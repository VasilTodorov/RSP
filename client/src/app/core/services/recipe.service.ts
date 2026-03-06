import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Recipe, CreateRecipeRequest } from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private http = inject(HttpClient);
  // Note: Ensured this matches your NestJS controller route (usually 'recipes')
  private readonly API_URL = 'http://localhost:3000/recipe';

  /**
   * 1. Get Recipes with Search Filters
   * Matches NestJS: findAll(query: { title, cuisineId, ingredientIds, dietaryId })
   */
  getRecipes(filters?: { 
    title?: string; 
    cuisineId?: number; 
    ingredientIds?: number[]; // Now an array for the "AND" logic
    dietaryId?: number 
  }) {
    let params = new HttpParams();

    if (filters) {
      if (filters.title) {
        params = params.set('title', filters.title);
      }
      if (filters.cuisineId) {
        params = params.set('cuisineId', filters.cuisineId.toString());
      }
      if (filters.dietaryId) {
        params = params.set('dietaryId', filters.dietaryId.toString());
      }
      
      // IMPORTANT: Use .append() in a loop for arrays
      // This creates the URL format: ?ingredientIds=1&ingredientIds=2
      if (filters.ingredientIds && filters.ingredientIds.length > 0) {
        filters.ingredientIds.forEach(id => {
          params = params.append('ingredientIds', id.toString());
        });
      }
    }

    return this.http.get<Recipe[]>(this.API_URL, { params });
  }

  
  createRecipe(recipeData: CreateRecipeRequest) {
    return this.http.post<Recipe>(this.API_URL, recipeData);
  }

  /**
   * 3. Get a single recipe by ID
   * Changed 'id' to number to match your TypeORM PrimaryKey
   */
  getRecipeById(id: number) {
    return this.http.get<Recipe>(`${this.API_URL}/${id}`);
  }

  /**
   * 4. Delete a recipe
   */
  deleteRecipe(id: number) {
    return this.http.delete(`${this.API_URL}/${id}`);
  }
}
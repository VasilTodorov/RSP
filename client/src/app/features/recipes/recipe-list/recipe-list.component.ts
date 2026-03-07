import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../../core/services/recipe.service';
import { Recipe } from '../../../core/models/recipe.model';
import { Ingredient } from '../../../core/models/ingredient.model';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { IngredientSearchComponent } from '../../../shared/components/ingredient-search/ingredient-search.component';
import { ViewChild } from '@angular/core'; // Import this

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    RecipeCardComponent, 
    IngredientSearchComponent
  ],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css'
})
export class RecipeListComponent implements OnInit {
  @ViewChild(IngredientSearchComponent) ingredientSearch!: IngredientSearchComponent;
  private recipeService = inject(RecipeService);

  // --- Data State ---
  recipes = signal<Recipe[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  // --- Search Filters ---
  searchTitle = signal('');
  selectedIngredientIds = signal<number[]>([]);

  ngOnInit() {
    this.loadRecipes(); // Load everything on start
  }

  // Receives the array from the IngredientSearchComponent
  onIngredientsChanged(ingredients: Ingredient[]) {
    const ids = ingredients.map(i => i.id);
    this.selectedIngredientIds.set(ids);
  }

  loadRecipes() {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.recipeService.getRecipes({
      title: this.searchTitle(),
      ingredientIds: this.selectedIngredientIds().length > 0 
        ? this.selectedIngredientIds() 
        : undefined
    }).subscribe({
      next: (data) => {
        this.recipes.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Search Error:', err);
        this.errorMessage.set('Could not fetch recipes. Please try again.');
        this.isLoading.set(false);
      }
    });
  }

  onReset() {
    // 1. Clear Parent's own state
    this.searchTitle.set('');
    
    // 2. Tell the Child to reset itself!
    if (this.ingredientSearch) {
      this.ingredientSearch.reset();
    }

    // 3. Re-run the search to show all recipes
    this.loadRecipes();
  }
}
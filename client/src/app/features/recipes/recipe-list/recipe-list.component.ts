import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeService } from '../../../core/services/recipe.service';
import { Recipe } from '../../../core/models/recipe.model';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';
import { IngredientService } from '../../../core/services/ingredient.service';
import { Ingredient } from '../../../core/models/ingredient.model';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RecipeCardComponent],
  templateUrl: './recipe-list.component.html',
  styleUrl: './recipe-list.component.css'
})
export class RecipeListComponent implements OnInit {
  private ingredientService = inject(IngredientService);

  ingredientResults = signal<Ingredient[]>([]);
  selectedIngredients = signal<Ingredient[]>([]);

  private recipeService = inject(RecipeService);

  recipes = signal<Recipe[]>([]);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  searchTitle = signal('');
  ingredientIdsInput = signal(''); // Users type "1, 2"

  ngOnInit() {
    this.loadRecipes();
  }

  
  loadRecipes() {
  // Get the IDs from our objects: [ {id: 1, name: 'Tomato'} ] -> [1]
  const ids = this.selectedIngredients().map(ing => ing.id);

  this.recipeService.getRecipes({
    title: this.searchTitle(),
    ingredientIds: ids.length > 0 ? ids : undefined
  }).subscribe(data => this.recipes.set(data));
}

  onReset() {
    this.searchTitle.set('');
    this.ingredientIdsInput.set('');
    this.loadRecipes();
  }

  onTypeIngredient(event: Event) {
    const value = (event.target as HTMLInputElement).value;

    // THE 3 CHAR RULE: Only call the server if we have enough letters
    if (value.length >= 3) {
      this.ingredientService.searchIngredients(value).subscribe(results => {
        this.ingredientResults.set(results);
      });
    } else {
      this.ingredientResults.set([]); // Clear results if backspaced
    }
  }

  // 2. Add to your "AND" search list
  addIngredient(ing: Ingredient, inputField: HTMLInputElement) {
    // Only add if not already in the list
    if (!this.selectedIngredients().some(i => i.id === ing.id)) {
      this.selectedIngredients.update(list => [...list, ing]);
    }
    
    // Clear everything to reset the UI
    this.ingredientResults.set([]); 
    inputField.value = ''; 
  }

  removeIngredient(id: number) {
    this.selectedIngredients.update(list => list.filter(i => i.id !== id));
  }
}
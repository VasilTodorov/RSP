// 1. The "View" Model (Matches what the API returns)
export interface Recipe {
  id: number;
  title: string;
  description?: string;
  instructions: string;
  imageURL?: string;
  author: { id: number; email: string };
  cuisine: Cuisine; 
  dietaryPreferences: DietaryPreference[];
  recipeIngredients: RecipeIngredient[];
}

// 2. Helper Interfaces
export interface Cuisine {
  id: number;
  name: string;
}

export interface DietaryPreference
{
    id: number;
    name: string;
}
export interface RecipeIngredient {
    recipeId: number;               
    ingredientId: number;
    ingredient: { 
        name: string;
        id: number;
    };
    amount: string;
}

// 3. The "Payload" Model (Matches your CreateRecipeDto)
// Use this for your "Create Recipe" form
export interface CreateRecipeRequest {
  title: string;
  description?: string;
  instructions: string;
  imageURL?: string;
  cuisineId: number;
  dietaryPreferenceIds?: number[];
  ingredients: { ingredientId: number; amount: string }[];
}
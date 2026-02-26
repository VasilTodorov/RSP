export class CreateRecipeDto {
  title: string;
  description: string;
  instructions: string;
  
  // The ID of the Cuisine (e.g., 1 for "Italian")
  cuisineId: number;

  // An array of IDs for Dietary Preferences (e.g., [1, 3] for "Vegan" and "Gluten-Free")
  dietaryPreferenceIds: number[];

  // This is the tricky part: An array of objects for the Custom Join Table
  ingredientData: RecipeIngredientInput[];
}

// We define a small helper class/interface for the ingredients
export class RecipeIngredientInput {
  ingredientId: number; // The ID of the existing ingredient (e.g., "Salt")
  amount: string;       // The specific amount for THIS recipe (e.g., "1 tsp")
}
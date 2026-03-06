// src/recipes/dto/recipe-ingredient.dto.ts
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class RecipeIngredientDto {
  @IsInt()
  @IsNotEmpty()
  ingredientId: number;

  @IsString()
  @IsNotEmpty()
  amount: string; 
}
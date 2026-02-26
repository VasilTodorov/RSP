// src/recipes/entities/recipe-ingredient.entity.ts
import { Entity, Column, ManyToOne, PrimaryColumn, JoinColumn } from 'typeorm';
import { Recipe } from './recipe.entity';
import { Ingredient } from '../../ingredient/entities/ingredient.entity';

@Entity()
export class RecipeIngredient {
  @PrimaryColumn()
  recipeId: number;

  @PrimaryColumn()
  ingredientId: number;

  @Column()
  amount: string; // e.g., "200g" or "1 tablespoon"

  @ManyToOne(() => Recipe, (recipe) => recipe.recipeIngredients,  { 
  onDelete: 'CASCADE' // <--- This is the magic line
})
  @JoinColumn({ name: 'recipeId'})
  recipe: Recipe;

  @ManyToOne(() => Ingredient, (ingredient) => ingredient.recipeIngredients)
  @JoinColumn({ name: 'ingredientId'})
  ingredient: Ingredient;
}
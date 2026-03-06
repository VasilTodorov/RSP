import { IsString, IsNotEmpty, IsOptional, IsUrl, IsArray, IsInt, ValidateNested, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { RecipeIngredientDto } from './recipe-ingredient.dto';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  instructions: string;

  @IsUrl()
  @IsOptional()
  imageURL?: string;

  @IsInt()
  @IsNotEmpty()
  cuisineId: number;

  @IsArray()
  @IsOptional()
  @IsInt({ each: true })
  dietaryPreferenceIds?: number[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => RecipeIngredientDto)
  ingredientData: RecipeIngredientDto[]; 
}
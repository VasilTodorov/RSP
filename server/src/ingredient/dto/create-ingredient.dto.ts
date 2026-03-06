// src/ingredient/dto/create-ingredient.dto.ts
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty({ message: 'Ingredient name cannot be empty' })
  @MinLength(2, { message: 'Ingredient name is too short' })
  @MaxLength(50, { message: 'Ingredient name is too long' })
  name: string;
}
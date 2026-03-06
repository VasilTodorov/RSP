// src/dietary_preferences/dto/create-dietary-preference.dto.ts
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateDietaryPreferenceDto {
  @IsString()
  @IsNotEmpty({ message: 'Preference name is required' })
  @MinLength(3, { message: 'Preference name must be at least 3 characters' })
  @MaxLength(30, { message: 'Preference name is too long' })
  name: string;
}
import { IsString, IsNotEmpty, MinLength, MaxLength } from 'class-validator';

export class CreateCuisineDto {
  @IsString()
  @IsNotEmpty({ message: 'Cuisine name is required' })
  @MinLength(3, { message: 'Cuisine name must be at least 3 characters' })
  @MaxLength(30, { message: 'Cuisine name is too long' })
  name: string;
}
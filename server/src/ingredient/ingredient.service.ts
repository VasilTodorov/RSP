import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { ILike } from 'typeorm';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto) {
    try {
      // Normalize before sending to DB
      createIngredientDto.name = createIngredientDto.name.toLowerCase().trim();
      
      const newIngredient = this.ingredientRepository.create(createIngredientDto);
      return await this.ingredientRepository.save(newIngredient);
      
    } catch (error) {
      // Catching the database's "No"
      if (error.code === '23505') {
        throw new ConflictException(`Ingredient "${createIngredientDto.name}" already exists`);
      }
      throw error;
    }
  }

  async findAll(name?: string) {
  return await this.ingredientRepository.find({
    where: name ? { name: ILike(`${name}%`) } : {},
    order: { name: 'ASC' }, // Nice for frontend lists
  });
}

  async findOne(id: number) {
    return await this.ingredientRepository.findOne({ where: { id } });
    
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto) {
    try {
      // 1. We sanitize the name if it's being updated
      if (updateIngredientDto.name) {
        updateIngredientDto.name = updateIngredientDto.name.toLowerCase().trim();
      }

      const result = await this.ingredientRepository.update(id, updateIngredientDto);

      if (result.affected === 0) {
        throw new NotFoundException(`Ingredient #${id} not found`);
      }

      return await this.findOne(id);

    } catch (error) {
      // 2. Check if the error is a "Unique Violation" (Postgres code 23505)
      if (error.code === '23505') {
        throw new ConflictException(
          `An ingredient with the name "${updateIngredientDto.name}" already exists.`
        );
      }
      // 3. If it's something else, throw the original error
      throw error;
    }
  }

  async remove(id: number) {
  try {
    const result = await this.ingredientRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Ingredient #${id} not found`);
    }
    
    return { message: 'Ingredient deleted successfully' };

  } catch (error) {
    // Postgres code '23503' is a Foreign Key Violation
    if (error.code === '23503') {
      throw new ConflictException(
        `This ingredient cannot be deleted because it is currently used in one or more recipes.`
      );
    }
    throw error;
  }
}
}
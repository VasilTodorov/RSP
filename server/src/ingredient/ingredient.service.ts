import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Injectable()
export class IngredientService {
  constructor(
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
  ) {}

  async create(createIngredientDto: CreateIngredientDto) {
    // Check if it already exists to avoid the Unique Constraint error
    const existing = await this.ingredientRepository.findOne({ 
      where: { name: createIngredientDto.name } 
    });
    
    if (existing) {
      throw new ConflictException(`Ingredient "${createIngredientDto.name}" already exists`);
    }

    const newIngredient = this.ingredientRepository.create(createIngredientDto);
    return await this.ingredientRepository.save(newIngredient);
  }

  findAll() {
    return this.ingredientRepository.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    return await this.ingredientRepository.findOne({ where: { id } });
    
  }

  async update(id: number, updateIngredientDto: UpdateIngredientDto) {
  // 1. Sanitize the incoming name
  if (updateIngredientDto.name) {

    // 2. THE PROACTIVE CHECK: Does another ingredient already have this name?
    const existingWithSameName = await this.ingredientRepository.findOne({
      where: { name: updateIngredientDto.name }
    });

    // If we found one, and it's NOT the one we are currently editing
    if (existingWithSameName && existingWithSameName.id !== id) {
      throw new ConflictException(
        `Cannot rename to "${updateIngredientDto.name}" because that name is already in use.`
      );
    }
  }

  // 3. Perform the update now that we know the coast is clear
  const result = await this.ingredientRepository.update(id, updateIngredientDto);

  if (result.affected === 0) {
    throw new NotFoundException(`Ingredient #${id} not found`);
  }

  return this.findOne(id);
}

  async remove(id: number) {
    // SECURITY CHECK: Is this ingredient being used in any recipes?
    const ingredient = await this.ingredientRepository.findOne({
      where: { id },
      relations: ['recipeIngredients'],
    });

    if (!ingredient) throw new NotFoundException(`Ingredient #${id} not found`);

    if (ingredient.recipeIngredients.length > 0) {
      throw new ConflictException(
        `Cannot delete "${ingredient.name}" because it is used in ${ingredient.recipeIngredients.length} recipes.`,
      );
    }

    return await this.ingredientRepository.delete(id);
  }
}
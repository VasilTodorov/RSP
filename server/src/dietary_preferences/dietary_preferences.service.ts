import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DietaryPreference } from './entities/dietary_preference.entity';
import { CreateDietaryPreferenceDto } from './dto/create-dietary_preference.dto';
import { UpdateDietaryPreferenceDto } from './dto/update-dietary_preference.dto';
import { ILike } from 'typeorm';

@Injectable()
export class DietaryPreferencesService {
  constructor(
    @InjectRepository(DietaryPreference)
    private dietaryRepository: Repository<DietaryPreference>,
  ) {}

  async create(createDietaryPreferenceDto: CreateDietaryPreferenceDto) {
    try {
      // Normalize before sending to DB
      createDietaryPreferenceDto.name = createDietaryPreferenceDto.name.toLowerCase().trim();
      
      const newDietaryPreference = this.dietaryRepository.create(createDietaryPreferenceDto);
      return await this.dietaryRepository.save(newDietaryPreference);
      
    } catch (error) {
      // Catching the database's "No"
      if (error.code === '23505') {
        throw new ConflictException(`Dietary Preference "${createDietaryPreferenceDto.name}" already exists`);
      }
      throw error;
    }
  }
    async findAll(name?: string) {
    return await this.dietaryRepository.find({
      where: name ? { name: ILike(`${name}%`) } : {},
      order: { name: 'ASC' }, // Nice for frontend lists
    });
  }

  async findOne(id: number) {
    return await this.dietaryRepository.findOne({ where: { id } });
    
  }

  async update(id: number, updateDietaryPreferenceDto: UpdateDietaryPreferenceDto) {
      try {
        // 1. We sanitize the name if it's being updated
        if (updateDietaryPreferenceDto.name) {
          updateDietaryPreferenceDto.name = updateDietaryPreferenceDto.name.toLowerCase().trim();
        }
  
        const result = await this.dietaryRepository.update(id, updateDietaryPreferenceDto);
  
        if (result.affected === 0) {
          throw new NotFoundException(`Dietary Preference #${id} not found`);
        }
  
        return await this.findOne(id);
  
      } catch (error) {
        // 2. Check if the error is a "Unique Violation" (Postgres code 23505)
        if (error.code === '23505') {
          throw new ConflictException(
            `An Dietary Preference with the name "${updateDietaryPreferenceDto.name}" already exists.`
          );
        }
        // 3. If it's something else, throw the original error
        throw error;
      }
    }

  async remove(id: number) {
  try {
    const result = await this.dietaryRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Dietary Preference #${id} not found`);
    }
    
    return { message: 'Dietary Preference deleted successfully' };

  } catch (error) {
    // Postgres code '23503' is a Foreign Key Violation
    if (error.code === '23503') {
      throw new ConflictException(
        `This Dietary Preference cannot be deleted because it is currently used in one or more recipes.`
      );
    }
    throw error;
  }
}
}

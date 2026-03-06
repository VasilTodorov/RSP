import { Injectable,ConflictException,NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cuisine } from './entities/cuisine.entity';
import { CreateCuisineDto } from './dto/create-cuisine.dto';
import { UpdateCuisineDto } from './dto/update-cuisine.dto';
import { ILike } from 'typeorm';

@Injectable()
export class CuisineService {
  constructor(
      @InjectRepository(Cuisine)
      private cuisineRepository: Repository<Cuisine>,
  ){}
  async create(createCuisineDto: CreateCuisineDto) {
      try {
        // Normalize before sending to DB
        createCuisineDto.name = createCuisineDto.name.toLowerCase().trim();
        
        const newCuisine = this.cuisineRepository.create(createCuisineDto);
        return await this.cuisineRepository.save(newCuisine);
        
      } catch (error) {
        // Catching the database's "No"
        if (error.code === '23505') {
          throw new ConflictException(`Cuisine "${createCuisineDto.name}" already exists`);
        }
        throw error;
      }
    }

  async findAll(name?: string) {
    return await this.cuisineRepository.find({
      where: name ? { name: ILike(`${name}%`) } : {},
      order: { name: 'ASC' }, // Nice for frontend lists
    });
  }

  async findOne(id: number) {
    return await this.cuisineRepository.findOne({ where: { id } });
    
  }

  async update(id: number, updateCuisineDto: UpdateCuisineDto) {
      try {
        // 1. We sanitize the name if it's being updated
        if (updateCuisineDto.name) {
          updateCuisineDto.name = updateCuisineDto.name.toLowerCase().trim();
        }
  
        const result = await this.cuisineRepository.update(id, updateCuisineDto);
  
        if (result.affected === 0) {
          throw new NotFoundException(`Cuisine #${id} not found`);
        }
  
        return await this.findOne(id);
  
      } catch (error) {
        // 2. Check if the error is a "Unique Violation" (Postgres code 23505)
        if (error.code === '23505') {
          throw new ConflictException(
            `An Cusine with the name "${updateCuisineDto.name}" already exists.`
          );
        }
        // 3. If it's something else, throw the original error
        throw error;
      }
    }

  async remove(id: number) {
    try {
      const result = await this.cuisineRepository.delete(id);

      if (result.affected === 0) {
        throw new NotFoundException(`Cusine #${id} not found`);
      }
      
      return { message: 'Cusine deleted successfully' };

    } catch (error) {
      // Postgres code '23503' is a Foreign Key Violation
      if (error.code === '23503') {
        throw new ConflictException(
          `This Cusine cannot be deleted because it is currently used in one or more recipes.`
        );
      }
      throw error;
    }
  }
}

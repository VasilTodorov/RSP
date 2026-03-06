import { Injectable, NotFoundException,ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
// Import the DTOs that the CLI generated for you
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>, // This is what talks to Postgres
  ) {}

  // Change this to use the repository
  
    async create(createUserDto: CreateUserDto) {
      try {
        // Normalize before sending to DB
        const email = createUserDto.email.toLowerCase().trim();
        
        const newUser = this.usersRepository.create(createUserDto);
        return await this.usersRepository.save(newUser);
        
      } catch (error) {
        // Catching the database's "No"
        if (error.code === '23505') {
          throw new ConflictException(`User "${createUserDto.email}" already exists`);
        }
        throw error;
      }
    }
  
  // Add this method (The CLI doesn't create it by default)
  async findOneByEmail(email: string): Promise<User | null> {
    return await this.usersRepository.findOne({ where: { email } });
  }

  // You can leave these CLI-generated ones as is or update them later
  async findAll() {
    return await this.usersRepository.find({
      select: ['id', 'email'], // Security: Don't return passwords in a list
    });
  }

  async findOne(id: number) {
    return await this.usersRepository.findOne({ where: { id },select: ['id', 'email'] });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
      try {
        // 1. We sanitize the name if it's being updated
        if (updateUserDto.email) {
          updateUserDto.email = updateUserDto.email.toLowerCase().trim();
        }
  
        const result = await this.usersRepository.update(id, updateUserDto);
  
        if (result.affected === 0) {
          throw new NotFoundException(`Ingredient #${id} not found`);
        }
  
        return await this.findOne(id);
  
      } catch (error) {
        // 2. Check if the error is a "Unique Violation" (Postgres code 23505)
        if (error.code === '23505') {
          throw new ConflictException(
            `An ingredient with the name "${updateUserDto.email}" already exists.`
          );
        }
        // 3. If it's something else, throw the original error
        throw error;
      }
    }

  async remove(id: number) {
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return { deleted: true };
  }
}


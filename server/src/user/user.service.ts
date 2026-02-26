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
    const existingUser = await this.findOneByEmail(createUserDto.email);
    
    if (existingUser) {
      // 409 Conflict is the perfect HTTP code for this
      throw new ConflictException('This email is already registered');
    }

    const newUser = this.usersRepository.create(createUserDto);
    return await this.usersRepository.save(newUser);
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
    if (updateUserDto.email) {

    // 2. THE PROACTIVE CHECK: Does another ingredient already have this name?
    const existingWithSameEmail = await this.usersRepository.findOne({
      where: { email: updateUserDto.email }
    });

    // If we found one, and it's NOT the one we are currently editing
    if (existingWithSameEmail && existingWithSameEmail.id !== id) {
      throw new ConflictException(
        `Cannot change to email "${updateUserDto.email}" because that email is already in use.`
      );
    }
  }
    // 1. Destructure to explicitly ignore a password if it somehow sneaks in
    const { password, ...safeData } = updateUserDto;

    // 2. Perform the update
    const result = await this.usersRepository.update(id, safeData);

    // 3. Handle the "Not Found" case
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 4. Return the fresh user data
    return this.findOne(id);
  }

  async remove(id: number) {
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`User #${id} not found`);
    }

    return { deleted: true };
  }
}


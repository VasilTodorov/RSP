import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException,UseGuards, Query } from '@nestjs/common';
import { CuisineService } from './cuisine.service';
import { CreateCuisineDto } from './dto/create-cuisine.dto';
import { UpdateCuisineDto } from './dto/update-cuisine.dto';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {AdminGuard} from '../auth/roles.guard';

@Controller('cuisine')
export class CuisineController {
  constructor(private readonly cuisineService: CuisineService) {}

  @Post()
  @UseGuards(JwtAuthGuard, AdminGuard)
  create(@Body() createCuisineDto: CreateCuisineDto) {
    return this.cuisineService.create(createCuisineDto);
  }

  @Get()
    findAll(@Query('name') name?: string) {
      return this.cuisineService.findAll(name);
    }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    //return this.ingredientService.findOne(+id);
        const couisine = await this.cuisineService.findOne(+id);
        if (!couisine) {
          
          throw new NotFoundException(`Recipe with ID ${id} does not exist`);
        }
          
        return couisine;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateCuisineDto: UpdateCuisineDto) {
    return this.cuisineService.update(+id, updateCuisineDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.cuisineService.remove(+id);
  }
}

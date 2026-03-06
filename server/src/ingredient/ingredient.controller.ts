import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, UseGuards, Query } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import {JwtAuthGuard} from '../auth/jwt-auth.guard';
import {AdminGuard} from '../auth/roles.guard';


@Controller('ingredient')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Post()
  @UseGuards(JwtAuthGuard,AdminGuard)
  create(@Body() createIngredientDto: CreateIngredientDto) {
    return this.ingredientService.create(createIngredientDto);
  }

  @Get()
  findAll(@Query('name') name?: string) {
    return this.ingredientService.findAll(name);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    //return this.ingredientService.findOne(+id);
    const ingredient = await this.ingredientService.findOne(+id);
    if (!ingredient) {
      
      throw new NotFoundException(`Recipe with ID ${id} does not exist`);
    }
      
    return ingredient;
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  update(@Param('id') id: string, @Body() updateIngredientDto: UpdateIngredientDto) {
    return this.ingredientService.update(+id, updateIngredientDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, AdminGuard)
  remove(@Param('id') id: string) {
    return this.ingredientService.remove(+id);
  }
}

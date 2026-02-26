import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,Request, Query, NotFoundException } from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import your guard

@Controller('recipe')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createRecipeDto: any, @Request() req) {
    // req.user is populated by the Guard from the JWT
    const userId = req.user.userId; 
    console.log('User ID from Token:', userId);
    
    return this.recipeService.create(createRecipeDto, userId);
  }

  @Get()
  findAll(
    @Query('cuisineId') cuisineId?: number,
    @Query('ingredientId') ingredientId?: number,
    @Query('dietaryId') dietaryId?: number,
  ) {
    return this.recipeService.findAll({ cuisineId, ingredientId, dietaryId });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const recipe = await this.recipeService.findOne(+id);
    if (!recipe) {
      // This is where we get "loud" for the frontend
      throw new NotFoundException(`Recipe with ID ${id} does not exist`);
    }
  
    return recipe;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
    return this.recipeService.update(+id, updateRecipeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recipeService.remove(+id);
  }
}

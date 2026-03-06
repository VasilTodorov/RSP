import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,Request, Query, NotFoundException, ForbiddenException , UploadedFile, UseInterceptors} from '@nestjs/common';
import { RecipeService } from './recipe.service';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard'; // Import your guard
import {AdminGuard} from '../auth/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('recipe')
@UseGuards(JwtAuthGuard)
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}

  @Post(':id/upload')
  @UseInterceptors(FileInterceptor('image', { // 'image' is the field name from the frontend
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        // Create a unique name: e.g., recipe-123.jpg
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const fileExt = extname(file.originalname);
        callback(null, `recipe-${uniqueName}${fileExt}`);
      },
    }),
  }))
  async uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    // Construct the URL: http://localhost:3000/uploads/recipe-123.jpg
    const imagePath = `/uploads/${file.filename}`;
    
    // Call your service to update the recipe's imageURL column
    return this.recipeService.updateImage(+id, imagePath);
  }
  @Post()
  create(@Body() createRecipeDto: CreateRecipeDto, @Request() req) {
    // req.user is populated by the Guard from the JWT
    const userId = req.user.userId; 
    console.log('User ID from Token:', userId);
    
    return this.recipeService.create(createRecipeDto, userId);
  }

  @Get()
  findAll(
  @Query('title') title?: string,
  @Query('cuisineId') cuisineId?: number,
  @Query('dietaryId') dietaryId?: number,
  // 1. Rename to plural and allow string or array
  @Query('ingredientIds') ingredientIds?: string | string[], 
  ) {
    // 2. Transform the input into a clean number array
    let ids: number[] | undefined = undefined;

    if (ingredientIds) {
      // If it's a single string, wrap it in an array; if it's already an array, use it
      const rawIds = Array.isArray(ingredientIds) ? ingredientIds : [ingredientIds];
      
      // Convert all strings to numbers and filter out any junk
      ids = rawIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id));
    }

    // 3. Pass the clean object to the service
    return this.recipeService.findAll({ 
      title, 
      cuisineId: cuisineId ? Number(cuisineId) : undefined, 
      dietaryId: dietaryId ? Number(dietaryId) : undefined,
      ingredientIds: ids // This is now your array for the "AND" logic
    });
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

  async update(
    @Param('id') id: string, 
    @Body() updateRecipeDto: UpdateRecipeDto, 
    @Request() req
  ) {
    const loggedInUserId = req.user.userId;
    const recipeId = +id;

    // 1. We MUST fetch the recipe first to see who the author is
    const recipe = await this.recipeService.findOne(recipeId);

    // 2. The Guard Check: Compare logged-in ID with the recipe's author ID
    if (recipe!.author.id !== loggedInUserId) {
      throw new ForbiddenException('You are not allowed to edit someone else’s recipe!');
    }

    // 3. If check passes, proceed to the service
    return this.recipeService.update(recipeId, updateRecipeDto);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string) {
    return this.recipeService.remove(+id);
  }
}

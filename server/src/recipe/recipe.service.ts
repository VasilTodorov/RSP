import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { ILike } from 'typeorm';

@Injectable()
export class RecipeService {
  constructor(
    @InjectRepository(Recipe)
    private recipeRepository: Repository<Recipe>,  
    @InjectRepository(RecipeIngredient)
    private recipeIngredientRepository: Repository<RecipeIngredient>,
    private dataSource: DataSource, // Used for transactions
  ) {}

  async updateImage(recipeId: number, imagePath: string) {
    const recipe = await this.recipeRepository.findOneBy({ id: recipeId });
    if (!recipe) throw new NotFoundException('Recipe not found');
    
    recipe.imageURL = imagePath;
    return this.recipeRepository.save(recipe);
  }
  
  async create(createRecipeDto: CreateRecipeDto, userId: number) {
    const { ingredientData, cuisineId, dietaryPreferenceIds, ...recipeDetails } = createRecipeDto;

    // We use a queryRunner to make sure everything succeeds or everything fails together
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create the Recipe Instance
      const recipe = queryRunner.manager.create(Recipe, {
        ...recipeDetails,
        author: { id: userId }, // Link the author from JWT
        cuisine: { id: cuisineId }, // Link the Cuisine
        dietaryPreferences: dietaryPreferenceIds?.map(id => ({ id })), // Link Many-to-Many
      });

      const savedRecipe = await queryRunner.manager.save(recipe);
      // 2. Handle the Ingredients with Amounts
      if (ingredientData && ingredientData.length > 0) {
        const recipeIngredients = ingredientData.map((item: any) => {
          return queryRunner.manager.create(RecipeIngredient, {
            recipeId: savedRecipe.id,
            ingredientId: item.ingredientId,
            amount: item.amount,
          });
        });

        await queryRunner.manager.save(recipeIngredients);
      }
      const fullRecipe = await queryRunner.manager.findOne(Recipe, {
        where: { id: savedRecipe.id },
        relations: [
          'author', 
          'cuisine', 
          'dietaryPreferences', 
          'recipeIngredients', 
          'recipeIngredients.ingredient'
        ],
        // Same select logic as findOne
        select: {
          author: { id: true, email: true }
        }
      });
      await queryRunner.commitTransaction();
      return fullRecipe;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
async findAll(query: { title?: string, cuisineId?: number; ingredientIds?: number[]; dietaryId?: number }) {
    const { title, cuisineId, ingredientIds, dietaryId } = query;

    const qb = this.recipeRepository.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.author', 'author')
      .leftJoinAndSelect('recipe.cuisine', 'cuisine')
      .leftJoinAndSelect('recipe.dietaryPreferences', 'dietaryPreferences')
      .leftJoinAndSelect('recipe.recipeIngredients', 'ri')
      .leftJoinAndSelect('ri.ingredient', 'ingredient');

    // Filter by Title
    if (title) qb.andWhere('recipe.title ILIKE :title', { title: `%${title}%` });

    // Filter by Cuisine
    if (cuisineId) qb.andWhere('recipe.cuisineId = :cuisineId', { cuisineId });

    // Filter by Dietary
    if (dietaryId) qb.andWhere('dietaryPreferences.id = :dietaryId', { dietaryId });

    // THE "AND" LOGIC: This ensures the recipe has ALL requested ingredients
    if (ingredientIds && ingredientIds.length > 0) {
      qb.andWhere((sub) => {
        const query = sub.subQuery()
          .select('res.id')
          .from(Recipe, 'res')
          .innerJoin('res.recipeIngredients', 'ri')
          .where('ri.ingredientId IN (:...ids)', { ids: ingredientIds })
          .groupBy('res.id')
          .having('COUNT(DISTINCT ri.ingredientId) = :count', { count: ingredientIds.length })
          .getQuery();
        return 'recipe.id IN ' + query;
      });
    }

    return await qb.orderBy('recipe.title', 'ASC').getMany();
  }

  async findOne(id: number) {
  return await this.recipeRepository.findOne({
      where: { id },
      relations: [
        'author',             // Joins the User table
        'cuisine',            // Joins the Cuisine table
        'dietaryPreferences', // Joins the many-to-many table
        'recipeIngredients',  // Joins the custom join table
        'recipeIngredients.ingredient' // Deep join: Joins the actual Ingredient name!
      ],
      select: {
        author: {
          id: true,
          email: true,
        },
      },
    });
  }

  async update(id: number, updateRecipeDto: UpdateRecipeDto) {   
  const recipeExists = await this.recipeRepository.findOneBy({ id });
  if (!recipeExists) {
    throw new NotFoundException(`Recipe with ID ${id} not found`);
  }

  const { ingredientData, cuisineId, dietaryPreferenceIds, ...recipeDetails } = updateRecipeDto;

  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Update the main Recipe fields
    // This looks for the recipe by ID and applies the new title/description/cuisine
    await queryRunner.manager.update(Recipe, id, {
      ...recipeDetails,
      cuisine: cuisineId ? { id: cuisineId } : undefined,
    });

    // 2. Update Dietary Preferences (ManyToMany)
    if (dietaryPreferenceIds) {
      const recipe = await queryRunner.manager.findOne(Recipe, { 
        where: { id }, 
        relations: ['dietaryPreferences'] 
      });
      if (!recipe) {
        throw new NotFoundException(`Recipe with ID ${id} not found`);
      }
      recipe.dietaryPreferences = dietaryPreferenceIds.map(id => ({ id } as any));
      await queryRunner.manager.save(recipe);
    }

    // 3. Handle Ingredients (The "Delete and Re-insert" strategy)
    if (ingredientData) {
      // First, remove all existing ingredients for this recipe
      await queryRunner.manager.delete(RecipeIngredient, { recipeId: id });

      // Then, insert the new ones
      const newIngredients = ingredientData.map((item: any) => {
        return queryRunner.manager.create(RecipeIngredient, {
          recipeId: id,
          ingredientId: item.ingredientId,
          amount: item.amount,
        });
      });
      await queryRunner.manager.save(newIngredients);
    }

    await queryRunner.commitTransaction();
    return this.findOne(id); // Return the updated recipe so the frontend can see it

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: number) {
  // We use delete instead of remove because it's faster for single IDs
  const result = await this.recipeRepository.delete(id);

  if (result.affected === 0) {
    throw new NotFoundException(`Recipe with ID ${id} not found`);
  }

  return { deleted: true };
}
}

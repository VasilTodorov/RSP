import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipeModule } from './recipe/recipe.module';
import { IngredientModule } from './ingredient/ingredient.module';
import { CuisineModule } from './cuisine/cuisine.module';
import { DietaryPreferencesModule } from './dietary_preferences/dietary_preferences.module';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User } from './user/entities/user.entity';
import { Recipe } from './recipe/entities/recipe.entity';
import { RecipeIngredient} from './recipe/entities/recipe-ingredient.entity';
import { Ingredient } from './ingredient/entities/ingredient.entity';
import { Cuisine} from './cuisine/entities/cuisine.entity';
import { DietaryPreference } from './dietary_preferences/entities/dietary_preference.entity'
import { AuthModule } from './auth/auth.module';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres', 
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'test1234',
      database: 'recipe_db',
      entities:[User, Recipe,RecipeIngredient, Ingredient, Cuisine, DietaryPreference],
      autoLoadEntities: true, // This is key! It finds your .entity.ts files automatically
      synchronize: true, // Set to false in production, but great for development
    }),RecipeModule, IngredientModule, CuisineModule, DietaryPreferencesModule, UserModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

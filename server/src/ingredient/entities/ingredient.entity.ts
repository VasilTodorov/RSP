import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { RecipeIngredient } from '../../recipe/entities/recipe-ingredient.entity';

@Entity()
export class Ingredient {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string; // e.g., "200g" or "1 tablespoon"

    @OneToMany(() => RecipeIngredient, (ir) => ir.ingredient)
    recipeIngredients: RecipeIngredient[];
}

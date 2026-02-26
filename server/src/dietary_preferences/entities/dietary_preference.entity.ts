import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Recipe } from 'src/recipe/entities/recipe.entity';

@Entity()
export class DietaryPreference {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ unique: true })
    name: string;
    @ManyToMany(() => Recipe)  
    recipes: Recipe[];
}

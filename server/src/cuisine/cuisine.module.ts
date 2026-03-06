import { Module } from '@nestjs/common';
import { CuisineService } from './cuisine.service';
import { CuisineController } from './cuisine.controller';
import { TypeOrmModule} from '@nestjs/typeorm';
import { Cuisine } from './entities/cuisine.entity';


@Module({
  imports: [
        TypeOrmModule.forFeature([Cuisine]) // Add both here!
      ],
  controllers: [CuisineController],
  providers: [CuisineService],
})
export class CuisineModule {}

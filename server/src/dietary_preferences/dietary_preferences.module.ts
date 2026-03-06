import { Module } from '@nestjs/common';
import { DietaryPreferencesService } from './dietary_preferences.service';
import { DietaryPreferencesController } from './dietary_preferences.controller';
import { DietaryPreference } from './entities/dietary_preference.entity';
import { TypeOrmModule} from '@nestjs/typeorm';

@Module({
  imports: [
        TypeOrmModule.forFeature([DietaryPreference]) // Add both here!
      ],
  controllers: [DietaryPreferencesController],
  providers: [DietaryPreferencesService],
})
export class DietaryPreferencesModule {}

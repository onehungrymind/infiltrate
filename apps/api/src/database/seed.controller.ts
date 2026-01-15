import { Controller, Post, HttpCode, HttpStatus, Inject } from '@nestjs/common';
import { SeederService } from './seeder.service';
import { Public } from '../auth/decorators/public.decorator';
import { DataSource } from 'typeorm';
import { migrateSourceConfigsToManyToMany } from '../source-configs/migrations/migrate-to-many-to-many';

@Controller('seed')
export class SeedController {
  constructor(
    private readonly seederService: SeederService,
    private readonly dataSource: DataSource,
  ) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.OK)
  async seedDatabase() {
    try {
      await this.seederService.seed();
      return {
        success: true,
        message: 'Database seeded successfully!',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error seeding database',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }


  @Public()
  @Post('clear')
  @HttpCode(HttpStatus.OK)
  async clearDatabase() {
    try {
      // You might want to add a clear method to your seeder service
      await this.seederService.clearDatabase();
      return {
        success: true,
        message: 'Database cleared successfully!',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Error clearing database',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Public()
  @Post('migrate-sources')
  @HttpCode(HttpStatus.OK)
  async migrateSourceConfigs() {
    try {
      const result = await migrateSourceConfigsToManyToMany(this.dataSource);
      return {
        ...result,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        success: false,
        message: 'Migration failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

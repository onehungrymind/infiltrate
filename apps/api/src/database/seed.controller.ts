import { Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { SeederService } from './seeder.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly seederService: SeederService) {}

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
}

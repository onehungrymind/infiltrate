import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Session } from './entities/session.entity';
import { SessionTemplate } from './entities/session-template.entity';
import { GymnasiumController } from './gymnasium.controller';
import { GymnasiumService } from './gymnasium.service';
import { GymnasiumSeedService } from './gymnasium-seed.service';
import { SessionRendererService } from './rendering/session-renderer.service';
import { SessionGeneratorService } from './generation/session-generator.service';

@Module({
  imports: [TypeOrmModule.forFeature([Session, SessionTemplate])],
  controllers: [GymnasiumController],
  providers: [
    GymnasiumService,
    GymnasiumSeedService,
    SessionRendererService,
    SessionGeneratorService,
  ],
  exports: [GymnasiumService, SessionRendererService, SessionGeneratorService],
})
export class GymnasiumModule {}

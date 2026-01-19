import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { SessionTemplate } from './entities/session-template.entity';
import {
  DEFAULT_DARK_CSS,
  DEFAULT_DARK_TEMPLATE,
  DEFAULT_TEMPLATE_METADATA,
} from './templates/default-dark.template';

@Injectable()
export class GymnasiumSeedService implements OnModuleInit {
  private readonly logger = new Logger(GymnasiumSeedService.name);

  constructor(
    @InjectRepository(SessionTemplate)
    private readonly templateRepository: Repository<SessionTemplate>,
  ) {}

  async onModuleInit() {
    await this.seedDefaultTemplate();
  }

  async seedDefaultTemplate(): Promise<void> {
    // Check if default template already exists
    const existingTemplate = await this.templateRepository.findOne({
      where: { name: DEFAULT_TEMPLATE_METADATA.name, isSystem: true },
    });

    if (existingTemplate) {
      this.logger.log('Default template already exists, skipping seed');
      return;
    }

    this.logger.log('Seeding default gymnasium template...');

    const template = this.templateRepository.create({
      ...DEFAULT_TEMPLATE_METADATA,
      htmlTemplate: DEFAULT_DARK_TEMPLATE,
      cssStyles: DEFAULT_DARK_CSS,
    });

    await this.templateRepository.save(template);

    this.logger.log('Default gymnasium template seeded successfully');
  }

  /**
   * Force reseed - updates the template even if it exists
   * Useful for template updates
   */
  async reseedDefaultTemplate(): Promise<SessionTemplate> {
    const existingTemplate = await this.templateRepository.findOne({
      where: { name: DEFAULT_TEMPLATE_METADATA.name, isSystem: true },
    });

    if (existingTemplate) {
      existingTemplate.htmlTemplate = DEFAULT_DARK_TEMPLATE;
      existingTemplate.cssStyles = DEFAULT_DARK_CSS;
      existingTemplate.description = DEFAULT_TEMPLATE_METADATA.description;
      existingTemplate.supportsPrint = DEFAULT_TEMPLATE_METADATA.supportsPrint;
      existingTemplate.supportsDarkMode = DEFAULT_TEMPLATE_METADATA.supportsDarkMode;
      return this.templateRepository.save(existingTemplate);
    }

    const template = this.templateRepository.create({
      ...DEFAULT_TEMPLATE_METADATA,
      htmlTemplate: DEFAULT_DARK_TEMPLATE,
      cssStyles: DEFAULT_DARK_CSS,
    });

    return this.templateRepository.save(template);
  }
}

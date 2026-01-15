/**
 * Migration script to migrate from SourceConfig (one-to-many) to Source + SourcePathLink (many-to-many)
 *
 * This script:
 * 1. Reads all existing source_configs
 * 2. Creates unique Source entries (deduplicated by URL)
 * 3. Creates SourcePathLink entries to connect sources to their original learning paths
 *
 * Usage:
 * - Import and call migrateSourceConfigsToManyToMany(dataSource) from a seed script or controller
 * - Or use the MigrationController endpoint: POST /api/migrate/source-configs
 */

import { DataSource } from 'typeorm';
import { SourceConfig } from '../entities/source-config.entity';
import { Source } from '../entities/source.entity';
import { SourcePathLink } from '../entities/source-path-link.entity';

export interface MigrationResult {
  success: boolean;
  message: string;
  stats: {
    sourceConfigsProcessed: number;
    sourcesCreated: number;
    linksCreated: number;
    duplicatesSkipped: number;
  };
}

export async function migrateSourceConfigsToManyToMany(dataSource: DataSource): Promise<MigrationResult> {
  const sourceConfigRepo = dataSource.getRepository(SourceConfig);
  const sourceRepo = dataSource.getRepository(Source);
  const linkRepo = dataSource.getRepository(SourcePathLink);

  const stats = {
    sourceConfigsProcessed: 0,
    sourcesCreated: 0,
    linksCreated: 0,
    duplicatesSkipped: 0,
  };

  try {
    // Get all existing source configs
    const sourceConfigs = await sourceConfigRepo.find();
    console.log(`Found ${sourceConfigs.length} source configs to migrate`);

    if (sourceConfigs.length === 0) {
      return {
        success: true,
        message: 'No source configs to migrate',
        stats,
      };
    }

    // Track URLs we've already processed to handle duplicates
    const processedUrls = new Map<string, string>(); // url -> source id

    for (const config of sourceConfigs) {
      stats.sourceConfigsProcessed++;

      // Check if we already have a Source with this URL
      let sourceId = processedUrls.get(config.url);

      if (!sourceId) {
        // Check if source already exists in the database
        const existingSource = await sourceRepo.findOne({ where: { url: config.url } });

        if (existingSource) {
          sourceId = existingSource.id;
          stats.duplicatesSkipped++;
        } else {
          // Create new Source
          const newSource = sourceRepo.create({
            url: config.url,
            type: config.type,
            name: config.name,
          });
          const savedSource = await sourceRepo.save(newSource);
          sourceId = savedSource.id;
          stats.sourcesCreated++;
        }

        processedUrls.set(config.url, sourceId);
      } else {
        stats.duplicatesSkipped++;
      }

      // Check if link already exists
      const existingLink = await linkRepo.findOne({
        where: {
          sourceId: sourceId,
          pathId: config.pathId,
        },
      });

      if (!existingLink) {
        // Create SourcePathLink
        const link = linkRepo.create({
          sourceId: sourceId,
          pathId: config.pathId,
          enabled: config.enabled,
        });
        await linkRepo.save(link);
        stats.linksCreated++;
      }
    }

    console.log('Migration complete:', stats);

    return {
      success: true,
      message: `Successfully migrated ${stats.sourceConfigsProcessed} source configs`,
      stats,
    };
  } catch (error) {
    console.error('Migration failed:', error);
    return {
      success: false,
      message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      stats,
    };
  }
}

/**
 * SQL version for manual execution:
 *
 * -- 1. Create sources from unique URLs in source_configs
 * INSERT INTO sources (id, url, type, name, createdAt, updatedAt)
 * SELECT
 *   lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
 *   substr(lower(hex(randomblob(2))),2) || '-' ||
 *   substr('89ab',abs(random()) % 4 + 1, 1) ||
 *   substr(lower(hex(randomblob(2))),2) || '-' ||
 *   lower(hex(randomblob(6))) as id,
 *   url,
 *   type,
 *   name,
 *   datetime('now'),
 *   datetime('now')
 * FROM source_configs
 * GROUP BY url;
 *
 * -- 2. Create source_path_links
 * INSERT INTO source_path_links (id, sourceId, pathId, enabled, createdAt, updatedAt)
 * SELECT
 *   lower(hex(randomblob(4))) || '-' || lower(hex(randomblob(2))) || '-4' ||
 *   substr(lower(hex(randomblob(2))),2) || '-' ||
 *   substr('89ab',abs(random()) % 4 + 1, 1) ||
 *   substr(lower(hex(randomblob(2))),2) || '-' ||
 *   lower(hex(randomblob(6))) as id,
 *   s.id as sourceId,
 *   sc.pathId,
 *   sc.enabled,
 *   datetime('now'),
 *   datetime('now')
 * FROM source_configs sc
 * JOIN sources s ON s.url = sc.url;
 */

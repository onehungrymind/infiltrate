import { Logger } from '@nestjs/common';

export interface UrlMetadata {
  title?: string;
  description?: string;
  platform?: string;
  repoStats?: {
    stars?: number;
    language?: string;
    lastCommit?: Date;
  };
}

const logger = new Logger('UrlMetadataFetcher');

/**
 * Detect platform from URL
 */
function detectPlatform(url: string): string {
  const urlLower = url.toLowerCase();
  if (urlLower.includes('github.com')) return 'github';
  if (urlLower.includes('codepen.io')) return 'codepen';
  if (urlLower.includes('codesandbox.io')) return 'codesandbox';
  if (urlLower.includes('replit.com')) return 'replit';
  if (urlLower.includes('jsfiddle.net')) return 'jsfiddle';
  if (urlLower.includes('stackblitz.com')) return 'stackblitz';
  return 'other';
}

/**
 * Parse GitHub repository URL
 * Returns owner and repo if valid GitHub repo URL
 */
function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const patterns = [
    /github\.com\/([^/]+)\/([^/]+)/,
    /github\.com\/([^/]+)\/([^/]+)\.git/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      return {
        owner: match[1],
        repo: match[2].replace(/\.git$/, ''),
      };
    }
  }
  return null;
}

/**
 * Fetch GitHub repository stats
 */
async function fetchGitHubStats(owner: string, repo: string): Promise<{
  stars?: number;
  language?: string;
  lastCommit?: Date;
  description?: string;
} | null> {
  try {
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Kasita-Learning-Platform',
      },
    });

    if (!response.ok) {
      logger.warn(`GitHub API returned ${response.status} for ${owner}/${repo}`);
      return null;
    }

    const data = await response.json();

    return {
      stars: data.stargazers_count,
      language: data.language,
      lastCommit: data.pushed_at ? new Date(data.pushed_at) : undefined,
      description: data.description,
    };
  } catch (error) {
    logger.warn(`Failed to fetch GitHub stats for ${owner}/${repo}: ${error}`);
    return null;
  }
}

/**
 * Fetch basic page metadata (title, description) from HTML
 */
async function fetchPageMetadata(url: string): Promise<{ title?: string; description?: string } | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Kasita-Learning-Platform/1.0',
      },
    });

    if (!response.ok) {
      logger.warn(`Failed to fetch page ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : undefined;

    // Extract meta description
    const descriptionMatch = html.match(
      /<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i,
    ) || html.match(
      /<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i,
    );
    const description = descriptionMatch ? descriptionMatch[1].trim() : undefined;

    return { title, description };
  } catch (error) {
    logger.warn(`Failed to fetch page metadata for ${url}: ${error}`);
    return null;
  }
}

/**
 * Fetch URL metadata
 * Automatically detects platform and fetches relevant metadata
 */
export async function fetchUrlMetadata(url: string): Promise<UrlMetadata> {
  const metadata: UrlMetadata = {
    platform: detectPlatform(url),
  };

  // For GitHub URLs, fetch repository stats
  if (metadata.platform === 'github') {
    const repoInfo = parseGitHubUrl(url);
    if (repoInfo) {
      const stats = await fetchGitHubStats(repoInfo.owner, repoInfo.repo);
      if (stats) {
        metadata.title = `${repoInfo.owner}/${repoInfo.repo}`;
        metadata.description = stats.description;
        metadata.repoStats = {
          stars: stats.stars,
          language: stats.language,
          lastCommit: stats.lastCommit,
        };
        return metadata;
      }
    }
  }

  // For other URLs, fetch basic page metadata
  const pageMetadata = await fetchPageMetadata(url);
  if (pageMetadata) {
    metadata.title = pageMetadata.title;
    metadata.description = pageMetadata.description;
  }

  return metadata;
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

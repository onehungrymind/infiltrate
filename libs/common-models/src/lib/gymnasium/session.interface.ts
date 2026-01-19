/**
 * Session Types for Gymnasium Feature
 */

import { ContentBlock } from './content-blocks.interface';

// === Session Structure ===

export interface SessionSection {
  id: string;
  number?: number; // 1, 2, 3... (optional)
  title: string;
  anchor: string; // URL-safe anchor: "basic-resource-inspection"
  blocks: ContentBlock[];
}

export interface SessionPart {
  id: string;
  number: string; // "I", "II", "1", "Part One"
  title: string;
  description?: string; // Part intro text
  sections: SessionSection[];
}

export interface SessionContent {
  parts: SessionPart[];
}

// === Session Metadata ===

export type SessionDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert';
export type SessionVisibility = 'private' | 'unlisted' | 'public';

export interface Session {
  id: string;
  slug: string; // URL-friendly identifier: "kubernetes-fundamentals"

  // Metadata
  title: string; // "Kubernetes Fundamentals"
  subtitle?: string; // "A Practitioner's Guide"
  description: string; // For listings/SEO
  domain: string; // "DevOps", "Frontend", "API"
  tags: string[]; // ["kubernetes", "docker", "devops"]
  difficulty: SessionDifficulty;
  estimatedMinutes: number; // Total estimated time

  // Cover/Branding
  badgeText?: string; // "Practitioner's Guide"
  coverMeta?: string[]; // ["24 Exercises", "3 Methods"]

  // Ownership
  creatorId: string;
  visibility: SessionVisibility;

  // Content (denormalized for performance and portability)
  content: SessionContent;

  // Timestamps
  createdAt: Date | string;
  updatedAt: Date | string;
  publishedAt?: Date | string;
}

// === Session Template ===

export interface SessionTemplate {
  id: string;
  name: string; // "Dark Professional"
  description: string;

  // Template content
  htmlTemplate: string; // Handlebars/Mustache template
  cssStyles: string; // CSS styles

  // Configuration
  supportsPrint: boolean;
  supportsDarkMode: boolean;

  // Ownership
  creatorId?: string;
  isSystem: boolean; // System templates can't be deleted

  createdAt: Date | string;
  updatedAt: Date | string;
}

// === User Progress ===

export interface SessionProgress {
  id: string;
  userId: string;
  sessionId: string;

  // Progress tracking
  currentPartIndex: number;
  currentSectionIndex: number;
  completedSections: string[]; // Section IDs

  // Timing
  startedAt: Date | string;
  lastActivityAt: Date | string;
  completedAt?: Date | string;
  totalTimeSeconds: number;
}

// === DTOs (for API) ===

export interface CreateSessionDto {
  title: string;
  subtitle?: string;
  description: string;
  domain: string;
  tags?: string[];
  difficulty?: SessionDifficulty;
  estimatedMinutes?: number;
  badgeText?: string;
  coverMeta?: string[];
  visibility?: SessionVisibility;
  content: SessionContent;
}

export interface UpdateSessionDto {
  title?: string;
  subtitle?: string;
  description?: string;
  domain?: string;
  tags?: string[];
  difficulty?: SessionDifficulty;
  estimatedMinutes?: number;
  badgeText?: string;
  coverMeta?: string[];
  visibility?: SessionVisibility;
  content?: SessionContent;
  publishedAt?: Date | string;
}

export interface GenerateSessionDto {
  topic: string;
  targetAudience?: string;
  difficulty?: SessionDifficulty;
  estimatedLength?: string; // "60 minutes"
  focusAreas?: string[];
  codeLanguage?: string;
  tone?: 'professional' | 'casual' | 'academic';
  visibility?: SessionVisibility;
}

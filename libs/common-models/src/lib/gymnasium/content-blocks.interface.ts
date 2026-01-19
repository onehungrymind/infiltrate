/**
 * Content Block Types for Gymnasium Sessions
 * These define the building blocks of session content
 */

// === Base Block ===

interface BaseBlock {
  type: string;
}

// === Text Content ===

export interface ProseBlock extends BaseBlock {
  type: 'prose';
  content: string; // Markdown or plain text
}

export interface HeadingBlock extends BaseBlock {
  type: 'heading';
  level: 2 | 3 | 4; // h2, h3, h4
  text: string;
  anchor?: string; // For linking
}

// === Code Content ===

export interface CodeBlock extends BaseBlock {
  type: 'code';
  language: string; // 'bash', 'typescript', 'yaml', 'json', etc.
  code: string; // The actual code
  label?: string; // Badge label like "YAML", "Example"
  filename?: string; // Optional filename display
  highlights?: number[]; // Line numbers to highlight
}

export interface CommandBlock extends BaseBlock {
  type: 'command';
  command: string; // Single command with $ prefix styling
}

export interface StructureBlock extends BaseBlock {
  type: 'structure';
  content: string; // Directory tree (pre-formatted)
}

export interface DiagramBlock extends BaseBlock {
  type: 'diagram';
  content: string; // ASCII art or diagram markup
  format: 'ascii' | 'mermaid'; // Rendering hint
}

// === Interactive/Exercise Content ===

export interface ExerciseBlock extends BaseBlock {
  type: 'exercise';
  badge: string; // "Exercise 1", "Advanced", "Scenario"
  title: string;
  goal?: string; // What the user should achieve
  content: string; // Markdown content (can include code blocks)
}

export interface TryThisBlock extends BaseBlock {
  type: 'tryThis';
  steps: string[]; // Numbered steps, can include inline code
}

export interface CalloutBlock extends BaseBlock {
  type: 'callout';
  variant: 'tip' | 'note' | 'warning' | 'info';
  title?: string; // Optional custom title
  content: string; // Markdown content
}

export interface KeyLearningBlock extends BaseBlock {
  type: 'keyLearning';
  content: string; // Important takeaway
}

// === Structural Content ===

export interface TableBlock extends BaseBlock {
  type: 'table';
  headers: string[];
  rows: string[][];
  caption?: string;
}

export interface ChecklistBlock extends BaseBlock {
  type: 'checklist';
  title?: string;
  items: string[];
}

export interface DividerBlock extends BaseBlock {
  type: 'divider';
  label?: string; // Optional section label
}

// === Discriminated Union ===

export type ContentBlock =
  | ProseBlock
  | HeadingBlock
  | CodeBlock
  | CommandBlock
  | StructureBlock
  | DiagramBlock
  | ExerciseBlock
  | TryThisBlock
  | CalloutBlock
  | KeyLearningBlock
  | TableBlock
  | ChecklistBlock
  | DividerBlock;

// === Type Guards ===

export function isProseBlock(block: ContentBlock): block is ProseBlock {
  return block.type === 'prose';
}

export function isCodeBlock(block: ContentBlock): block is CodeBlock {
  return block.type === 'code';
}

export function isExerciseBlock(block: ContentBlock): block is ExerciseBlock {
  return block.type === 'exercise';
}

export function isTryThisBlock(block: ContentBlock): block is TryThisBlock {
  return block.type === 'tryThis';
}

export function isCalloutBlock(block: ContentBlock): block is CalloutBlock {
  return block.type === 'callout';
}

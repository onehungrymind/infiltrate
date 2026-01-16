import { BadRequestException } from '@nestjs/common';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Allowed file types
const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
  // Images
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  // Code files
  'text/x-python',
  'application/javascript',
  'text/javascript',
  'application/typescript',
  'text/typescript',
  'text/html',
  'text/css',
  'application/json',
  'text/x-java',
  'text/x-c',
  'text/x-c++',
  // Archives
  'application/zip',
  'application/x-zip-compressed',
];

// Allowed extensions (as fallback when mime type detection fails)
const ALLOWED_EXTENSIONS = [
  '.pdf', '.doc', '.docx', '.txt', '.md',
  '.png', '.jpg', '.jpeg', '.gif', '.webp',
  '.py', '.js', '.ts', '.jsx', '.tsx', '.html', '.css', '.json',
  '.java', '.c', '.cpp', '.h', '.hpp',
  '.zip',
];

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Upload directory
const UPLOAD_DIR = join(process.cwd(), 'uploads', 'submissions');

// Ensure upload directory exists
export function ensureUploadDir(): void {
  if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

// File filter function
export function fileFilter(
  req: Express.Request,
  file: Express.Multer.File,
  callback: (error: Error | null, acceptFile: boolean) => void,
): void {
  const ext = extname(file.originalname).toLowerCase();

  // Check mime type or extension
  const isMimeAllowed = ALLOWED_MIME_TYPES.includes(file.mimetype);
  const isExtAllowed = ALLOWED_EXTENSIONS.includes(ext);

  if (isMimeAllowed || isExtAllowed) {
    callback(null, true);
  } else {
    callback(
      new BadRequestException(
        `File type not allowed. Allowed types: ${ALLOWED_EXTENSIONS.join(', ')}`,
      ),
      false,
    );
  }
}

// Storage configuration
export const submissionStorage = diskStorage({
  destination: (req, file, callback) => {
    ensureUploadDir();
    callback(null, UPLOAD_DIR);
  },
  filename: (req, file, callback) => {
    const uniqueId = uuidv4();
    const ext = extname(file.originalname);
    const filename = `${uniqueId}${ext}`;
    callback(null, filename);
  },
});

// Multer configuration
export const multerConfig = {
  storage: submissionStorage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
};

// Helper to build file metadata
export function buildFileMetadata(file: Express.Multer.File): {
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
} {
  return {
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    storagePath: file.path,
  };
}

// Export constants for use elsewhere
export { ALLOWED_EXTENSIONS,MAX_FILE_SIZE, UPLOAD_DIR };

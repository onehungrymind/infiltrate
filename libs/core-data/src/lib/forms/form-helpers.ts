import { FieldDef } from './field-def';

/**
 * Helper functions for form data transformation
 */

/**
 * Initializes an entity object with default values from field definitions.
 * This ensures all fields exist when creating a Signal Form.
 */
export function initializeEntity(fieldDefs: FieldDef[]): Record<string, any> {
  const entity: Record<string, any> = {};
  for (const fieldDef of fieldDefs) {
    if (fieldDef.type === 'checkbox') {
      entity[fieldDef.name] = false;
    } else if (fieldDef.type === 'select') {
      // Use first option value as default, or empty string
      entity[fieldDef.name] = fieldDef.options?.[0]?.value ?? '';
    } else {
      entity[fieldDef.name] = '';
    }
  }
  return entity;
}

/**
 * Converts array to comma-separated string for form display
 */
export function arrayToString(value: string[] | undefined | null): string {
  if (!value || !Array.isArray(value)) {
    return '';
  }
  return value.join(', ');
}

/**
 * Converts newline-separated string to array
 */
export function stringToArray(value: string | undefined | null): string[] {
  if (!value || typeof value !== 'string') {
    return [];
  }
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Converts comma-separated string to array
 */
export function commaStringToArray(value: string | undefined | null): string[] {
  if (!value || typeof value !== 'string') {
    return [];
  }
  return value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

/**
 * Processes form values to convert string arrays back to arrays
 */
export function processFormValues(values: Record<string, any>, arrayFields: string[], multilineArrayFields: string[]): Record<string, any> {
  const processed = { ...values };
  
  // Handle comma-separated arrays
  for (const field of arrayFields) {
    if (field in processed && typeof processed[field] === 'string') {
      processed[field] = commaStringToArray(processed[field]);
    }
  }
  
  // Handle newline-separated arrays
  for (const field of multilineArrayFields) {
    if (field in processed && typeof processed[field] === 'string') {
      processed[field] = stringToArray(processed[field]);
    }
  }
  
  return processed;
}


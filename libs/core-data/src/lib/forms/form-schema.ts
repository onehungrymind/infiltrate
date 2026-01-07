import { Schema, schema, required, minLength, maxLength, min, max, email, pattern, disabled, readonly } from '@angular/forms/signals';
import { FieldDef } from './field-def';

/**
 * Converts field definitions to a Signal Forms schema
 */
export function toSchema(meta: FieldDef[]): Schema<unknown> {
  return schema<unknown>((path) => {
    for (const fieldDef of meta) {
      const prop = fieldDef.name;
      const fieldPath = (path as any)[prop];

      if (!fieldPath) {
        continue;
      }

      // Apply disabled/readonly state
      if (fieldDef.disabled) {
        disabled(fieldPath);
      }

      if (fieldDef.readonly) {
        readonly(fieldPath);
      }

      // Apply validators based on field definition
      if (fieldDef.required) {
        required(fieldPath);
      }

      if (typeof fieldDef.minLength !== 'undefined') {
        minLength(fieldPath, fieldDef.minLength);
      }

      if (typeof fieldDef.maxLength !== 'undefined') {
        maxLength(fieldPath, fieldDef.maxLength);
      }

      if (typeof fieldDef.min !== 'undefined') {
        min(fieldPath, fieldDef.min);
      }

      if (typeof fieldDef.max !== 'undefined') {
        max(fieldPath, fieldDef.max);
      }

      if (fieldDef.type === 'email') {
        email(fieldPath);
      }

      if (fieldDef.type === 'url') {
        // URL pattern validation
        pattern(fieldPath, /^https?:\/\/.+/);
      }
    }
  });
}


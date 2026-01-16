import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { Field } from '@angular/forms/signals';
import { FieldDef } from '@kasita/core-data';
import { MaterialModule } from '@kasita/material';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [CommonModule, MaterialModule, Field],
  templateUrl: './dynamic-form.html',
  styleUrl: './dynamic-form.scss',
})
export class DynamicForm {
  @Input({ required: true }) metaInfo = signal<FieldDef[]>([]);
  @Input({ required: true }) dynamicForm!: any; // SignalForm object (created by form() from @angular/forms/signals)

  // Helper to get field from form
  getField(fieldName: string): any {
    try {
      // Get the form object (it's a direct property now, not a computed signal)
      const form = this.dynamicForm;
      
      // Check if form exists
      if (!form) {
        return null;
      }
      
      // Signal Forms creates fields as properties on the form object
      // Access the field directly - the form might be a Proxy but properties are accessible
      const field = (form as any)[fieldName];
      
      // Return the field - must be a valid Signal Forms Field object
      // The [field] directive expects a Field with controlValue, value, errors, etc.
      return field || null;
    } catch (error) {
      console.error('DynamicForm: error getting field', fieldName, error);
      return null;
    }
  }

  // Helper to check if field has errors
  hasErrors(field: any): boolean {
    if (!field || typeof field.errors !== 'function') {
      return false;
    }
    try {
      const errors = field.errors();
      return Array.isArray(errors) && errors.length > 0;
    } catch {
      return false;
    }
  }

  // Helper to get error messages
  getErrorMessages(field: any): string[] {
    if (!field || typeof field.errors !== 'function') {
      return [];
    }
    try {
      const errors = field.errors();
      if (!Array.isArray(errors)) {
        return [];
      }
      return errors.map((error: any) => {
        switch (error.name) {
          case 'required':
            return 'This field is required';
          case 'minlength':
            return `Minimum length is ${error.minLength}`;
          case 'maxlength':
            return `Maximum length is ${error.maxLength}`;
          case 'min':
            return `Minimum value is ${error.min}`;
          case 'max':
            return `Maximum value is ${error.max}`;
          case 'email':
            return 'Please enter a valid email address';
          case 'pattern':
            return 'Please enter a valid format';
          default:
            return error.message || 'Invalid value';
        }
      });
    } catch {
      return [];
    }
  }
}


/**
 * Field definition for dynamic form generation
 */
export interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'url' | 'textarea' | 'number' | 'date' | 'datetime-local' | 'checkbox' | 'select' | 'multiselect' | 'password';
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  placeholder?: string;
  options?: { value: any; label: string }[]; // For select/multiselect
  rows?: number; // For textarea
  disabled?: boolean;
  readonly?: boolean;
  helpText?: string;
}


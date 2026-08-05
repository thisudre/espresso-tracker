import { AbstractControl, ValidationErrors } from '@angular/forms';

export function requiredTrimmed(control: AbstractControl): ValidationErrors | null {
  const value = control.value;

  if (value == null || (typeof value === 'string' && value.trim() === '')) {
    return { requiredTrimmed: true };
  }

  return null;
}

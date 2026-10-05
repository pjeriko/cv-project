import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, ValidationErrors } from '@angular/forms';

// Une valeur vide ou faite d'espaces est refusée (même erreur « required »).
export function notBlank(control: AbstractControl): ValidationErrors | null {
  const value: string = control.value ?? '';
  return value.trim() === '' ? { required: true } : null;
}

// Chaîne vide ou faite d'espaces -> null, sinon valeur trimée.
export function orNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

// Messages d'erreur d'une réponse HTTP. notFoundMessage est propre à la ressource.
export function toMessages(err: unknown, notFoundMessage: string): string[] {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return ["Impossible de joindre l'API"];
    }
    if (err.status === 400) {
      const message: unknown = err.error?.message;
      if (Array.isArray(message)) {
        return message.map((m) => String(m));
      }
      if (typeof message === 'string') {
        return [message];
      }
      return ['Requête invalide (code 400)'];
    }
    if (err.status === 404) {
      return [notFoundMessage];
    }
    if (err.status === 409) {
      const message: unknown = err.error?.message;
      return [typeof message === 'string' ? message : 'Conflit (code 409)'];
    }
    return [`Erreur inattendue (code ${err.status})`];
  }
  return ['Erreur inattendue'];
}

// Validateur de GROUPE : champs 'startDate' et 'endDate' au format "YYYY-MM-DD"
// (la comparaison de chaînes suffit). Erreur portée par le groupe, affichée par le template.
export function dateOrder(group: AbstractControl): ValidationErrors | null {
  const start: string = group.get('startDate')?.value ?? '';
  const end: string = group.get('endDate')?.value ?? '';
  return start !== '' && end !== '' && end < start ? { dateOrder: true } : null;
}

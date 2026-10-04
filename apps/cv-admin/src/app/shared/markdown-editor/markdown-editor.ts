import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import MarkdownIt from 'markdown-it';

// Même configuration que apps/cv-public/src/app/shared/markdown/markdown.component.ts :
// à garder identique des deux côtés pour que l'aperçu reste fidèle au site.
// html: false  -> les balises HTML saisies sont affichées comme du texte.
// breaks: true -> un simple retour à la ligne devient un saut de ligne.
const md = new MarkdownIt({ html: false, breaks: true });

// Liens externes : ouverts dans un nouvel onglet.
const defaultLinkOpen =
  md.renderer.rules['link_open'] ??
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

md.renderer.rules['link_open'] = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('target', '_blank');
  tokens[idx].attrSet('rel', 'noopener noreferrer');
  return defaultLinkOpen(tokens, idx, options, env, self);
};

@Component({
  selector: 'app-markdown-editor',
  imports: [MatButtonModule],
  templateUrl: './markdown-editor.html',
  styleUrl: './markdown-editor.css',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkdownEditor),
      multi: true,
    },
  ],
})
export class MarkdownEditor implements ControlValueAccessor {
  readonly label = input.required<string>();
  readonly rows = input(6);

  protected readonly value = signal('');
  protected readonly disabled = signal(false);
  protected readonly preview = signal(false);

  // Le HTML produit est assaini par Angular à l'injection via [innerHTML].
  protected readonly html = computed(() => md.render(this.value()));
  protected readonly isEmpty = computed(() => this.value().trim() === '');

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  protected onInput(event: Event): void {
    const text = (event.target as HTMLTextAreaElement).value;
    this.value.set(text);
    this.onChange(text);
  }

  protected onBlur(): void {
    this.onTouched();
  }

  protected show(preview: boolean): void {
    this.preview.set(preview);
  }
}

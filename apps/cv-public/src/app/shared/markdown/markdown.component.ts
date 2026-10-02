import { Component, computed, input } from '@angular/core';
import MarkdownIt from 'markdown-it';

// Instance unique, partagée par tous les usages.
// html: false  -> les balises HTML écrites dans la source sont affichées comme du texte, jamais interprétées.
// breaks: true -> un simple retour à la ligne devient un saut de ligne (compatible avec les données existantes).
const md = new MarkdownIt({ html: false, breaks: true });

// Liens externes : ouverts dans un nouvel onglet, comme le lien « Voir le projet ».
const defaultLinkOpen =
  md.renderer.rules['link_open'] ??
  ((tokens, idx, options, _env, self) => self.renderToken(tokens, idx, options));

md.renderer.rules['link_open'] = (tokens, idx, options, env, self) => {
  tokens[idx].attrSet('target', '_blank');
  tokens[idx].attrSet('rel', 'noopener noreferrer');
  return defaultLinkOpen(tokens, idx, options, env, self);
};

@Component({
  selector: 'app-markdown',
  templateUrl: './markdown.component.html',
  host: { class: 'block' },
})
export class MarkdownComponent {
  source = input.required<string>();

  // Le HTML produit est ensuite assaini par Angular à l'injection via [innerHTML].
  protected readonly html = computed(() => md.render(this.source()));
}

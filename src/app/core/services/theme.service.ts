import { Injectable, effect, signal } from '@angular/core';
import { environment} from '../../../environments/environment';

type Theme = 'light' | 'dark';
const THEME_KEY = 'pcpedia.theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly theme = signal<Theme>(this.hydrate());

  constructor() {
    effect(() => {
      const t = this.theme();
      document.documentElement.classList.toggle('dark', t === 'dark');
      localStorage.setItem(THEME_KEY, t);
    }, { allowSignalWrites: true });
  }

  set(theme: Theme) { this.theme.set(theme); }
  toggle() { this.theme.set(this.theme() === 'dark' ? 'light' : 'dark'); }

  private hydrate(): Theme {
    const ls = localStorage.getItem(THEME_KEY) as Theme | null;
    return ls ?? 'light';
  }
}

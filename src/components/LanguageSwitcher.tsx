import { useTranslation } from 'react-i18next';
import type { Locale } from '../types';

// Compact uz/ru/en switcher. `tone` adapts colours for light vs dark surfaces.
export default function LanguageSwitcher({ tone = 'light' }: { tone?: 'light' | 'dark' }) {
  const { i18n } = useTranslation();
  const langs: Locale[] = ['uz', 'ru', 'en'];
  const active = tone === 'dark' ? 'bg-white/15 text-white' : 'bg-majolica-600 text-white';
  const idle = tone === 'dark' ? 'text-majolica-200 hover:bg-white/10' : 'text-majolica-600 hover:bg-majolica-50';
  return (
    <div className="flex items-center gap-1 text-sm">
      {langs.map((l) => (
        <button
          key={l}
          onClick={() => {
            i18n.changeLanguage(l);
            localStorage.setItem('locale', l);
          }}
          className={`rounded px-2 py-1 uppercase transition ${i18n.language === l ? active : idle}`}
          aria-pressed={i18n.language === l}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

import { AppLanguage } from '../types';
import { en, TranslationKeys } from './en';
import { id } from './id';

const dictionaries: Record<AppLanguage, Record<TranslationKeys, string>> = {
  en,
  id
};

let currentLang: AppLanguage = 'en';

export function setLanguage(lang: AppLanguage) {
  currentLang = lang;
  if (typeof document !== 'undefined') {
    document.documentElement.lang = lang;
  }
}

export function getLanguage(): AppLanguage {
  return currentLang;
}

export function t(key: TranslationKeys, params?: Record<string, string | number>): string {
  const dict = dictionaries[currentLang] || dictionaries.en;
  let text = dict[key] || en[key] || (key as string);

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }

  return text;
}

import type { Currency, Locale, Multilingual } from '../types';

// Pick the best available string for the active locale, falling back gracefully.
export function t(field: Multilingual | undefined, locale: Locale): string {
  if (!field) return '';
  return field[locale] || field.en || field.ru || field.uz || '';
}

// Prices are stored in minor units (tiyin/cents). Format for display.
export function formatPrice(minor: number, currency: Currency, locale: Locale): string {
  const major = currency === 'UZS' ? minor : minor / 100;
  const loc = locale === 'uz' ? 'uz-UZ' : locale === 'ru' ? 'ru-RU' : 'en-US';
  return new Intl.NumberFormat(loc, {
    style: 'currency',
    currency,
    maximumFractionDigits: currency === 'UZS' ? 0 : 2,
  }).format(major);
}

export function durationLabel(days: number, hours: number | null | undefined, locale: Locale) {
  if (days <= 1 && hours) {
    const unit = { uz: 'soat', ru: 'ч', en: 'h' }[locale];
    return `${hours} ${unit}`;
  }
  const unit = { uz: 'kun', ru: 'дн.', en: days === 1 ? 'day' : 'days' }[locale];
  return `${days} ${unit}`;
}

import { DEFAULT_LOCALE, LOCALE_STORAGE_KEY, SUPPORTED_LOCALES, type AppLocale } from '@/constants/locale'

function normalizeLocale(input: string | null | undefined): AppLocale {
  if (!input) {
    return DEFAULT_LOCALE
  }

  const normalized = input.toLowerCase().split('-')[0]
  return (SUPPORTED_LOCALES as readonly string[]).includes(normalized) ? (normalized as AppLocale) : DEFAULT_LOCALE
}

export function getCurrentLocale(): AppLocale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE
  }

  const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  if (storedLocale) {
    return normalizeLocale(storedLocale)
  }

  return normalizeLocale(window.navigator.language)
}

export function setCurrentLocale(locale: AppLocale) {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
}

export const SUPPORTED_LOCALES = ['vi', 'en', 'zh', 'ru', 'ja'] as const

export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'vi'
export const LOCALE_STORAGE_KEY = 'app_locale'

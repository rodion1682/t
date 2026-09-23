import { createI18n } from 'vue-i18n'
import en from '@/locales/en.json'

const i18n = createI18n({
  locale: 'en', // set default locale
  fallbackLocale: 'en', // set fallback locale
  messages: {
    en,
  },
  silentFallbackWarn: true,
  silentTranslationWarn: true,
  globalInjection: true,
})

export default i18n

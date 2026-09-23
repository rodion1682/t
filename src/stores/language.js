import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance from '@/plugins/axios'
import i18n from '@/plugins/i18n'

export const useLanguageStore = defineStore('language', () => {
  const languages = ref([])
  const currentLanguageId = ref(null)
  const isLoading = ref(false)
  const error = ref(null)
  // const translationsCache = ref({})

  // Getters
  const currentLanguage = computed(() =>
    languages.value.find(
      lang => lang.id.toString() === currentLanguageId.value?.toString(),
    ),
  )

  const currentLanguageCode = computed(
    () => currentLanguage.value?.code || 'en',
  )
  const currentLanguageName = computed(() => currentLanguage.value?.title || '')

  const getDefaultLanguage = () => {
    // First try to get the stored language
    const storedLangId = localStorage.getItem('languageId')
    if (
      storedLangId &&
      languages.value.some(lang => lang.id.toString() === storedLangId)
    ) {
      return storedLangId
    }

    // Then try to get the default language from the API
    const defaultLang = languages.value.find(lang => lang.default === 1)
    if (defaultLang) {
      return defaultLang.id.toString()
    }

    // Fallback to the first available language
    return languages.value[0]?.id.toString()
  }

  const loadTranslations = async langId => {
    if (!langId) return

    try {
      // // Check cache first
      // if (translationsCache.value[langId]) {
      //   const cachedTranslations = translationsCache.value[langId]
      //   const langCode = currentLanguage.value?.code || 'en'
      //   i18n.global.setLocaleMessage(langCode, cachedTranslations)
      //   i18n.global.locale = langCode
      //   return
      // }

      const { data } = await axiosInstance.get('localizations', {
        params: { lang_id: langId },
      })

      if (data) {
        // translationsCache.value[langId] = data
        const langCode = currentLanguage.value?.code || 'en'

        // Get existing local translations
        const existingTranslations = i18n.global.getLocaleMessage(langCode)

        // Merge API translations with existing translations
        const mergedTranslations = { ...existingTranslations, ...data }

        i18n.global.setLocaleMessage(langCode, mergedTranslations)
        i18n.global.locale = langCode
      }
    } catch (err) {
      console.error('Translation load error:', err.message)
    }
  }

  const changeLanguage = async langId => {
    if (!langId || langId.toString() === currentLanguageId.value) return

    currentLanguageId.value = langId.toString()
    localStorage.setItem('languageId', langId.toString())

    // Wait for the currentLanguage to be updated before calling loadTranslations
    await new Promise(resolve => setTimeout(resolve, 0)) // Force a microtask to update computed properties

    await loadTranslations(langId)
  }

  const fetchLanguages = async () => {
    isLoading.value = true
    try {
      const { data } = await axiosInstance.get('languages')

      if (data.status === 'OK' && Array.isArray(data.payload)) {
        languages.value = data.payload

        // Set the appropriate language after fetching
        const defaultLangId = getDefaultLanguage()
        await changeLanguage(defaultLangId)
      }
    } catch (err) {
      console.error('Language fetch error:', err)
      error.value = 'Failed to load languages'
    } finally {
      isLoading.value = false
    }
  }

  const initializeLanguages = async () => {
    if (languages.value.length === 0) {
      await fetchLanguages()
    } else if (!currentLanguageId.value) {
      // If languages are loaded but no current language is set
      const defaultLangId = getDefaultLanguage()
      await changeLanguage(defaultLangId)
    }
  }

  return {
    languages,
    currentLanguageId,
    isLoading,
    error,
    currentLanguage,
    currentLanguageCode,
    currentLanguageName,
    changeLanguage,
    fetchLanguages,
    initializeLanguages,
  }
})

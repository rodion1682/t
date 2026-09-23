<template>
  <LoadingSpinner v-if="appStore.isLoading" />

  <template v-else-if="appStore.initializationError">
    <div>
      <p>{{ $t('An error occurred during initialization:') }}</p>
      <p>{{ appStore.initializationError.message }}</p>
    </div>
  </template>
  <component :is="currentLayout" v-else>
    <RouterView v-slot="{ Component, route }">
      <component :is="Component" :key="route.path" />
    </RouterView>
  </component>
</template>

<script setup>
import { useAppStore } from '@/stores/app'
import { useCurrencyStore } from '@/stores/currency'
import { useLanguageStore } from '@/stores/language'
import { useSettingsStore } from '@/stores/settings'
import { computed, onBeforeMount, watch } from 'vue'
import { useRoute } from 'vue-router'
import LoadingSpinner from './components/LoadingSpinner.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'
import { useAuthStore } from './stores/auth'
import { useCartStore } from './stores/cart'
import { useCountriesStore } from './stores/countries'
import { useProductStore } from './stores/product'
import { useStaticStore } from './stores/static'
import { useUserStore } from './stores/user'

const appStore = useAppStore()
const route = useRoute()
const languageStore = useLanguageStore()
const currencyStore = useCurrencyStore()
const settingsStore = useSettingsStore()
const countriesStore = useCountriesStore()
const productStore = useProductStore()
const cartStore = useCartStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const staticStore = useStaticStore()

onBeforeMount(async () => {
  try {
    await Promise.all([
      // languageStore.fetchLanguages(),
      currencyStore.initializeCurrencies(),
      settingsStore.fetchSettings(),
      countriesStore.fetchCountries(),
      staticStore.fetchPages(),
    ])
    //productStore.fetchRandomProducts()
    cartStore.fetchCartContent()
    userStore.fetchProfile()
  } catch (error) {
    console.error('Error initializing app:', error)
    appStore.setInitializationError(error)
  } finally {
    appStore.setAppLoading(false)
  }
})

// Layout configuration
const layouts = {
  default: DefaultLayout,
  // Add more layouts as needed
}

const currentLayout = computed(() => {
  const layoutName = route.meta.layout || 'default'
  return layouts[layoutName] || layouts.default
})

watch(
  () => currencyStore.currentCurrencyCode,
  async () => {
    await settingsStore.fetchSettings()

    //productStore.fetchRandomProducts()
    userStore.fetchProfile()
    cartStore.fetchCartContent()

    if (route.name === 'ProductDetailsPage') {
      productStore.fetchProductDetails(route.params.productId)
    }
  },
)

watch(
  () => authStore.isAuthenticated,
  isAuthenticated => {
    if (isAuthenticated) {
      cartStore.fetchCartContent()
      userStore.fetchProfile()
    }
  },
)
</script>

// main.js
import { createPinia } from 'pinia'
import 'simplebar/dist/simplebar.css'
import { createApp } from 'vue'
import VueCookies from 'vue-cookies'
import './assets/styles/main.scss'
import axiosInstance from './plugins/axios'
import i18n from './plugins/i18n'
import { phonePlugin } from './plugins/phone'
import { toastPlugin } from './plugins/toast'

import BaseInput from '@/components/base/BaseInput.vue'
import BaseSelect from '@/components/base/BaseSelect.vue'
import App from './App.vue'
import BaseButton from './components/base/BaseButton.vue'
import BaseCheckbox from './components/base/BaseCheckbox.vue'
import BasePhone from './components/base/BasePhone.vue'
import PriceFormatter from './components/PriceFormatter.vue'
import router from './router'

// Create the app and pinia store early, but don't mount yet
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

app.config.warnHandler = () => { }
console.warn = () => {}

export function nukeHtmlInlineStyle() {
  const el = document.documentElement

  const strip = () => el.removeAttribute('style')

  strip()

  const mo = new MutationObserver(muts => {
    for (const m of muts) {
      if (m.type === 'attributes' && m.attributeName === 'style') strip()
    }
  })

  mo.observe(el, { attributes: true, attributeFilter: ['style'] })
  return () => mo.disconnect()
}
nukeHtmlInlineStyle()

// Import here after pinia is created
import { useAuthStore } from '@/stores/auth'

// Register global components
app.component('BaseInput', BaseInput)
app.component('BaseButton', BaseButton)
app.component('BaseCheckbox', BaseCheckbox)
app.component('BasePhone', BasePhone)
app.component('BaseSelect', BaseSelect)
app.component('PriceFormatter', PriceFormatter)
// Register plugins
app.use(router)
app.use(toastPlugin)
app.use(i18n)
app.use(phonePlugin, {
  mode: 'international',
})
app.use(VueCookies)

// Add Axios to the global properties
app.config.globalProperties.$http = axiosInstance

// Initialize authentication state before mounting the app
const initApp = async () => {
  try {
    // Get auth store and verify with server before mounting
    const authStore = useAuthStore()

    // Check authentication status with server
    await authStore.checkAuth()

    // Mount the app once authentication is verified
    app.mount('#app')
  } catch (error) {
    console.error('Failed to initialize app:', error)
    // Mount anyway in case of error
    app.mount('#app')
  }
}

// Start initialization
initApp()

// plugins/axios.js
import { useAuthStore } from '@/stores/auth'
import { useCurrencyStore } from '@/stores/currency'
import { useLanguageStore } from '@/stores/language'
import axios from 'axios'
import router from '@/router'
import { toast } from 'vue3-toastify'

// Request without currency/language parameters
// await axiosInstance.get('some-endpoint', { noParams: true })

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
axiosInstance.interceptors.request.use(
  config => {
    // Auth token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }

    // Add currency and language parameters
    if (!config.noParams) {
      const currencyStore = useCurrencyStore()
      const languageStore = useLanguageStore()

      if (config.method === 'get') {
        config.params = {
          ...config.params,
          currency: currencyStore.currentCurrencyCode,
          lang_id: languageStore.currentLanguageId,
        }
      } else if (['post', 'put', 'patch'].includes(config.method)) {
        config.data = {
          ...config.data,
          currency: currencyStore.currentCurrencyCode,
          lang_id: languageStore.currentLanguageId,
        }
      }
    }

    return config
  },
  error => Promise.reject(error),
)

// Response interceptor
axiosInstance.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      const authStore = useAuthStore()

      if (!authStore.sessionExpired) {
        // Check flag to avoid multiple notifications
        authStore.sessionExpired = true // Set session expired flag
        await authStore.logout()

        if (router.currentRoute.value.meta.requiresAuth) {
          toast.error('Error occurred. Please log in again.', {
            autoClose: 3000,
          })

          router.push({
            name: 'LoginPage',
            query: {
              redirect: router.currentRoute.value.fullPath,
            },
          })
        }
      }
    } else if (
      error.response?.status === 403 &&
      error.response?.data?.message === 'Your email address is not verified.'
    ) {
      // Redirect to email verification page
      router.push({
        name: 'EmailVerificationPage',
        query: { redirect: router.currentRoute.value.fullPath },
      })
    }

    return Promise.reject(error)
  },
)

export default axiosInstance

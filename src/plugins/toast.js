import Vue3Toastify, { toast } from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

export const toastPlugin = {
  install(app) {
    app.use(Vue3Toastify, {
      autoClose: 2500,
      clearOnUrlChange: false,
      position: 'bottom-right',
      theme: 'dark'
    })

    const toastFunctions = {
      info: (message, options) => toast.info(message, options),
      success: (message, options) => toast.success(message, options),
      warning: (message, options) => toast.warning(message, options),
      error: (message, options) => toast.error(message, options),
      default: (message, options) => toast(message, options),
    }

    // Provide toast functions globally
    app.provide('$toast', toastFunctions)

    // For backward compatibility
    app.config.globalProperties.$toast = toastFunctions
  },
}

export { toast }

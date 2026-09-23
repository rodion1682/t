// composables/useToast.js
import { toast } from 'vue3-toastify'

export function useToast() {
  const showToast = {
    info: (message, options = {}) => {
      return toast.info(message, {
        autoClose: 3000,
        ...options,
      })
    },
    success: (message, options = {}) => {
      return toast.success(message, {
        autoClose: 3000,
        ...options,
      })
    },
    warning: (message, options = {}) => {
      return toast.warning(message, {
        autoClose: 3000,
        ...options,
      })
    },
    error: (message, options = {}) => {
      return toast.error(message, {
        autoClose: 3000,
        ...options,
      })
    },
    default: (message, options = {}) => {
      return toast(message, {
        autoClose: 3000,
        ...options,
      })
    },
  }

  return showToast
}

import { ref } from 'vue'
import axios from '@/plugins/axios'

const isLoading = ref(false)
const error = ref(null)

const sendFeedback = async (formData) => {
  isLoading.value = true
  error.value = null
  
  try {
    const response = await axios.post('/feedback', {
      name: formData.name,
      email: formData.email,
      message: formData.question
    })
    
    return response.data
  } catch (err) {
    error.value = err.response?.data?.message || 'Failed to send feedback'
    throw err
  } finally {
    isLoading.value = false
  }
}

const clearError = () => {
  error.value = null
}

export const useContactStore = () => {
  return {
    isLoading,
    error,
    sendFeedback,
    clearError
  }
}

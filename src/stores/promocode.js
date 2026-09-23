// store/promocode.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/plugins/axios'

export const usePromoCodeStore = defineStore('promocode', () => {
  const currentPromo = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  const discount = computed(() => ({
    amount: currentPromo.value?.calculated_discount || 0,
    type: currentPromo.value?.type || 'fixed',
    applies_to_delivery: currentPromo.value?.applies_to_delivery || false,
  }))

  const hasActivePromo = computed(() => !!currentPromo.value)

  async function validatePromoCode(code) {
    if (!code) return { success: false, error: 'No promo code provided' }

    isLoading.value = true
    error.value = null

    try {
      const response = await axios.get('/promocode/check', { params: { code } })

      if (response.data.status === 'OK') {
        const promoData = response.data.payload
        currentPromo.value = promoData
        return { success: true, message: 'Promo code applied successfully' }
      }

      throw new Error(response.data.message)
    } catch (err) {
      error.value =
        err.response?.data?.message || 'Failed to validate promo code'
      return { success: false, error: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function setPromoCode(promoData) {
    currentPromo.value = {
      id: promoData.id || null,
      code: promoData.code,
      description: promoData.description || '',
      discount_type: promoData.discount_type || 'fixed',
      discount_amount: promoData.discount_amount || 0,
      applies_to_delivery: promoData.applies_to_delivery || false,
    }
  }

  function clearPromoCode() {
    currentPromo.value = null
    error.value = null
    isLoading.value = false
  }

  return {
    currentPromo,
    isLoading,
    error,
    discount,
    hasActivePromo,
    validatePromoCode,
    clearPromoCode,
    setPromoCode,
  }
})

import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useModalStore = defineStore('modal', () => {
  const activeModals = ref(new Set())
  const modalData = ref(new Map())

  const lockBodyScroll = () => {
    document.body.style.overflow = 'hidden'
  }

  const unlockBodyScroll = () => {
    document.body.style.overflow = ''
  }

  const open = (modalId, data = null) => {
    activeModals.value.add(modalId)
    if (data) {
      modalData.value.set(modalId, data)
    }
    // Lock body scroll when first modal opens
    if (activeModals.value.size === 1) {
      lockBodyScroll()
    }
  }

  const close = modalId => {
    activeModals.value.delete(modalId)
    modalData.value.delete(modalId)
    // Unlock body scroll when last modal closes
    if (activeModals.value.size === 0) {
      unlockBodyScroll()
    }
  }

  const closeAll = () => {
    activeModals.value.clear()
    modalData.value.clear()
    unlockBodyScroll()
  }

  const isOpen = modalId => {
    return activeModals.value.has(modalId)
  }

  const getData = modalId => {
    return modalData.value.get(modalId)
  }

  return {
    activeModals,
    modalData,
    open,
    close,
    closeAll,
    isOpen,
    getData,
  }
})

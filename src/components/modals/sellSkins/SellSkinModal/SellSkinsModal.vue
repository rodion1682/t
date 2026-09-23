<template>
  <BaseModal
    v-model:show="show"
    :wrapperClasses="['sell-skins__inner']"
    @close="handleClose"
  >
    <SellSkinFrom @success="handleSuccess" @cancel="handleClose" />
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue'
import SellSkinFrom from '@/components/modals/sellSkins/SellSkinModal/SellSkinFrom.vue'
import { computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'close'])

const show = computed({
  get: () => props.modelValue,
  set: value => emit('update:modelValue', value),
})

const forceUnlockScroll = () => {
  document.body.classList.remove('scroll-locked')
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''

  document.documentElement.style.overflow = ''
  document.documentElement.style.removeProperty('--scrollbar-compensation')

  if (document.__app_scroll_lock__) {
    document.__app_scroll_lock__.count = 0
  }
}

const handleClose = async () => {
  show.value = false
  emit('close')

  await nextTick()
  forceUnlockScroll()
}

const handleSuccess = async () => {
  show.value = false
  emit('close')

  await nextTick()
  forceUnlockScroll()

  await router.push('/account/offers')

  await nextTick()
  forceUnlockScroll()
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;

.sell-skins__inner {
  @include adaptiveValue('max-width', 520, 320);
}
</style>

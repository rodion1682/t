<template>
  <BaseModal
    :show="show"
    @close="close"
    :wrapperClasses="['sell-success__inner']"
  >
    <div class="sell-success">
      <div class="sell-success__top">
        <SvgIcon :icon="CheckIcon" class="sell-success__icon" />
        <div class="sell-success__title _l">
          {{ $t('Your request has been successfully accepted') }}
        </div>
      </div>
      <div class="sell-success__text">
        {{
          $t(
            'We will notify you about the processing of your request within 3 working days. ',
          )
        }}
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue'
import { CheckIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { onBeforeUnmount, watch } from 'vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
})

const emit = defineEmits(['close'])

let timer = null

const close = () => {
  emit('close')
}

watch(
  () => props.show,
  newVal => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    if (newVal) {
      timer = setTimeout(() => {
        close()
      }, 10000)
    }
  },
)

onBeforeUnmount(() => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.sell-success {
  margin: 0 auto;
  max-width: 652px;

  &__top {
    display: flex;
    background-color: var(--bg-primary-color);
    @include adaptiveValue('gap', 18, 15);
    @include adaptiveValue('border-radius', 12, 10);
    @include adaptiveValue('padding', 15, 10);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 24, 15);
    }
  }
  &__icon {
    color: var(--success-color);
    min-width: 22px;
    min-height: 17px;
  }

  &__title {
    font-weight: 700;
  }

  &__text {
    line-height: 18px;
  }
}
</style>

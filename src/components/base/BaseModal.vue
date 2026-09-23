<template>
  <Teleport to="body">
    <div v-if="show" class="modal" @click="handleBackdropClick">
      <div
        class="modal__inner background-gradient"
        :class="[wrapperClasses, modalContainerClass]"
        @click.stop
      >
        <button
          type="button"
          class="modal__close"
          :class="closeButtonClass"
          @click="handleClose"
        >
          <slot name="close-icon">
            <SvgIcon :icon="CloseIcon" class="modal__close-icon" />
          </slot>
        </button>

        <div class="modal__content">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { CloseIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

const props = defineProps({
  show: { type: Boolean, required: true },
  persistent: { type: Boolean, default: false },
  backdropClass: { type: String, default: '' },
  modalContainerClass: { type: String, default: '' },
  wrapperClasses: { type: String, default: '' },
  closeButtonClass: { type: String, default: '' },
})

const emit = defineEmits(['close', 'update:show'])

const innerRef = ref(null)

const GLOBAL_KEY = '__app_scroll_lock__'

const getScrollbarWidth = () => {
  return window.innerWidth - document.documentElement.clientWidth || 5
}

const getGlobalState = () => {
  if (!document[GLOBAL_KEY]) {
    document[GLOBAL_KEY] = {
      count: 0,
    }
  }

  return document[GLOBAL_KEY]
}

let didLock = false

const lockScrollGlobal = () => {
  if (didLock) return

  const state = getGlobalState()
  state.count += 1
  didLock = true

  const scrollbarWidth = getScrollbarWidth()

  document.documentElement.style.setProperty(
    '--scrollbar-compensation',
    `${scrollbarWidth}px`,
  )

  document.body.classList.add('scroll-locked')
}

const unlockScrollGlobal = () => {
  if (!didLock) return

  didLock = false

  const state = getGlobalState()
  state.count = Math.max(0, state.count - 1)

  if (state.count > 0) return

  document.body.classList.remove('scroll-locked')
  document.documentElement.style.removeProperty('--scrollbar-compensation')
}

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const handleBackdropClick = e => {
  if (!props.persistent && e.target === e.currentTarget) {
    handleClose()
  }
}

const handleEscKey = e => {
  if (e.key === 'Escape' && props.show && !props.persistent) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)

  if (props.show) {
    lockScrollGlobal()
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
  unlockScrollGlobal()
})

watch(
  () => props.show,
  async value => {
    if (value) {
      lockScrollGlobal()
      await nextTick()
      innerRef.value?.focus?.()
    } else {
      unlockScrollGlobal()
    }
  },
)

defineExpose({
  close: handleClose,
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.product-modal__inner {
  max-width: 466px;
}

.payment-modal__inner,
.details-modal__inner,
.password-change-modal__inner,
.reset__inner {
  max-width: 546px;
}

.withdraw-modal__inner,
.top-up-modal__inner {
  max-width: 832px;
}

.modal {
  position: fixed;
  inset: 0;
  z-index: var(--modal-z-index);

  display: flex;
  align-items: center;
  justify-content: center;

  background-color: rgb(11, 11, 18, 0.8);
  //backdrop-filter: 25px;
  //-webkit-backdrop-filter: 25px;

  @media (max-width: $md5) {
    align-items: flex-end;
    padding: 0;
  }

  &__inner {
    position: relative;
    width: 100%;
    max-height: calc(100vh - 40px);
    overflow: auto;
    @include adaptiveValue('padding-top', 60, 25);
    @include adaptiveValue('padding-bottom', 60, 25);
    @include adaptiveValue('padding-left', 40, 10, 1440, 768, 1);
    @include adaptiveValue('padding-right', 40, 10, 1440, 768, 1);
    @include adaptiveValue('border-radius', 20, 10);
    background-color: var(--bg-primary-color);
    border: 1px solid var(--border-primary-color);

    @media (max-width: $md5) {
      max-height: 90vh;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }
  }

  &__close {
    position: absolute;
    @include adaptiveValue('top', 10, 3);
    @include adaptiveValue('right', 10, 3);
    z-index: 5;
    display: flex;
    align-items: center;
    justify-content: center;
    width: fit-content;
    @include adaptiveValue('border-radius', 10, 4);
    @include adaptiveValue('min-width', 40, 30);
    @include adaptiveValue('height', 40, 30);
    padding: 0;
    border: none;
    background-color: transparent;
    color: var(--hint-primary-color);

    transition: all 0.3s ease 0s;

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
      }
    }
  }

  &__close-icon {
    @include adaptiveValue('min-width', 18, 14);
    @include adaptiveValue('width', 18, 14);
    @include adaptiveValue('height', 18, 14);
  }

  &__content {
    position: relative;
    z-index: 1;

    width: 100%;
    padding: 0;

    background: transparent;
  }
}
</style>

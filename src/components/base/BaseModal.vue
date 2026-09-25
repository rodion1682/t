<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="show"
        class="modal"
        :class="backdropClass"
        @mousedown="handleBackdropClick"
      >
        <div
          ref="innerRef"
          class="modal__inner"
          :class="[wrapperClasses, modalContainerClass]"
          role="dialog"
          aria-modal="true"
          tabindex="-1"
          @mousedown.stop
        >
          <button
            type="button"
            class="modal__close"
            :class="closeButtonClass"
            :aria-label="$t('Close')"
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
    </Transition>
  </Teleport>
</template>

<script setup>
import { nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

import { CloseIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },

  persistent: {
    type: Boolean,
    default: false,
  },

  backdropClass: {
    type: String,
    default: '',
  },

  modalContainerClass: {
    type: String,
    default: '',
  },

  wrapperClasses: {
    type: String,
    default: '',
  },

  closeButtonClass: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['close', 'update:show'])

const innerRef = ref(null)

const GLOBAL_KEY = '__app_scroll_lock__'

let didLock = false
let previouslyFocusedElement = null

const getScrollbarWidth = () => {
  return Math.max(0, window.innerWidth - document.documentElement.clientWidth)
}

const getGlobalState = () => {
  if (!document[GLOBAL_KEY]) {
    document[GLOBAL_KEY] = {
      count: 0,
    }
  }

  return document[GLOBAL_KEY]
}

const lockScrollGlobal = () => {
  if (didLock) {
    return
  }

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
  if (!didLock) {
    return
  }

  didLock = false

  const state = getGlobalState()

  state.count = Math.max(0, state.count - 1)

  if (state.count > 0) {
    return
  }

  document.body.classList.remove('scroll-locked')

  document.documentElement.style.removeProperty('--scrollbar-compensation')
}

const focusModal = async () => {
  await nextTick()

  innerRef.value?.focus({
    preventScroll: true,
  })
}

const handleClose = () => {
  emit('update:show', false)
  emit('close')
}

const handleBackdropClick = event => {
  if (props.persistent) {
    return
  }

  if (event.target === event.currentTarget) {
    handleClose()
  }
}

const handleEscKey = event => {
  if (event.key === 'Escape' && props.show && !props.persistent) {
    handleClose()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)

  if (props.show) {
    previouslyFocusedElement = document.activeElement

    lockScrollGlobal()
    focusModal()
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
      previouslyFocusedElement = document.activeElement

      lockScrollGlobal()

      await focusModal()

      return
    }

    unlockScrollGlobal()

    await nextTick()

    previouslyFocusedElement?.focus?.({
      preventScroll: true,
    })

    previouslyFocusedElement = null
  },
)

defineExpose({
  close: handleClose,
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
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
  z-index: var(--modal-z-index);

  inset: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  padding: 24px;

  background: rgba(32, 30, 29, 0.46);

  backdrop-filter: blur(7px);
  -webkit-backdrop-filter: blur(7px);

  overflow-x: hidden;
  overflow-y: auto;

  &__inner {
    position: relative;

    width: 100%;

    max-height: calc(100dvh - 48px);

    @include adaptiveValue('padding-top', 46, 30);

    @include adaptiveValue('padding-right', 40, 20);

    @include adaptiveValue('padding-bottom', 40, 28);

    @include adaptiveValue('padding-left', 40, 20);

    border: 1px solid rgba(130, 121, 106, 0.2);

    border-radius: 30px;

    background: var(--double-spanish-white);

    box-shadow:
      0 28px 80px rgba(32, 30, 29, 0.2),
      0 6px 24px rgba(32, 30, 29, 0.08);

    outline: none;

    overflow-x: hidden;
    overflow-y: auto;

    scrollbar-width: thin;
    scrollbar-color: var(--copper) transparent;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 20px;

      background: var(--copper);
    }

    &::-webkit-scrollbar-thumb:hover {
      background: var(--tuscany);
    }
  }

  &__close {
    position: absolute;
    z-index: 5;

    top: 16px;
    right: 16px;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 34px;
    min-width: 34px;
    height: 34px;

    padding: 0;

    border: 1px solid rgba(100, 92, 80, 0.2);

    border-radius: 50%;

    background: rgba(249, 244, 237, 0.7);

    color: var(--kelp);

    cursor: pointer;

    transition:
      color 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--copper);

        background: var(--copper);

        color: var(--merino);

        transform: rotate(6deg);
      }
    }

    &:focus-visible {
      border-color: var(--copper);

      outline: 2px solid var(--copper-10);

      outline-offset: 2px;
    }

    &:active {
      transform: scale(0.94);
    }
  }

  &__close-icon {
    width: 13px;
    min-width: 13px;
    height: 13px;

    color: inherit;

    :deep(svg) {
      display: block;

      width: 100%;
      height: 100%;
    }

    :deep(path) {
      stroke: currentColor;
    }
  }

  &__content {
    position: relative;
    z-index: 1;

    width: 100%;
    min-width: 0;

    padding: 0;

    background: transparent;

    color: var(--cod-gray);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;

  .modal__inner {
    transition:
      opacity 0.25s ease,
      transform 0.25s ease;
  }
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;

  .modal__inner {
    opacity: 0;

    transform: translateY(12px) scale(0.975);
  }
}

.modal-enter-to,
.modal-leave-from {
  opacity: 1;

  .modal__inner {
    opacity: 1;

    transform: translateY(0) scale(1);
  }
}

@media (max-width: $md5) {
  .modal {
    align-items: flex-end;

    padding: 16px 10px 0;

    &__inner {
      max-height: 92dvh;

      padding-top: 42px;

      border-bottom-right-radius: 0;
      border-bottom-left-radius: 0;
    }

    &__close {
      top: 12px;
      right: 14px;

      width: 32px;
      min-width: 32px;
      height: 32px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-enter-active,
  .modal-leave-active,
  .modal-enter-active .modal__inner,
  .modal-leave-active .modal__inner {
    transition: none;
  }
}
</style>

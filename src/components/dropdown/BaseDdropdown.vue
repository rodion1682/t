<template>
  <div
    ref="dropdownRef"
    class="base-dropdown"
    :class="[
      attrs.class,
      {
        'base-dropdown_open': isOpen,
        'base-dropdown_overflow': hasOverflow,
        'is-disabled': disabled,
      },
      variant ? `base-dropdown_${variant}` : '',
    ]"
  >
    <button
      type="button"
      class="base-dropdown__wrapper"
      :class="{ 'is-open': isOpen }"
      :aria-expanded="isOpen"
      :disabled="disabled"
      @click="toggle"
    >
      <span class="base-dropdown__label">
        {{ label }}
      </span>

      <span class="base-dropdown__caret">
        <SvgIcon
          :icon="ChevronDownIcon"
          class="base-dropdown__caret-icon"
          :class="{ 'is-open': isOpen }"
        />
      </span>
    </button>

    <Transition name="dropdown-fade">
      <div
        v-show="isOpen"
        ref="contentRef"
        class="base-dropdown__list"
        :class="{
          absolute,
          overflow: hasOverflow,
        }"
        :style="contentStyle"
      >
        <div ref="optionsRef" class="base-dropdown__options">
          <slot />
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  useAttrs,
  watch,
} from 'vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

defineOptions({
  inheritAttrs: false,
})

const attrs = useAttrs()

const props = defineProps({
  label: {
    type: String,
    default: '',
  },
  defaultOpen: {
    type: Boolean,
    default: false,
  },
  closeOnOutside: {
    type: Boolean,
    default: true,
  },
  closeOnEscape: {
    type: Boolean,
    default: true,
  },
  absolute: {
    type: Boolean,
    default: false,
  },
  variant: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const dropdownRef = ref(null)
const contentRef = ref(null)
const optionsRef = ref(null)

const isOpen = ref(props.defaultOpen)
const alignRight = ref(false)
const hasOverflow = ref(false)

let resizeObserver = null
let mutationObserver = null

const contentStyle = computed(() => {
  if (!props.absolute) {
    return {}
  }

  return alignRight.value
    ? {
        left: 'auto',
        right: '0',
      }
    : {
        left: '0',
        right: 'auto',
      }
})

const updateOverflowState = async () => {
  await nextTick()

  const contentEl = contentRef.value

  if (!contentEl || !isOpen.value) {
    hasOverflow.value = false
    return
  }

  hasOverflow.value = contentEl.scrollHeight > contentEl.clientHeight + 1
}

const updateDropdownPosition = async () => {
  if (!props.absolute || !isOpen.value) {
    alignRight.value = false
    await updateOverflowState()
    return
  }

  await nextTick()

  const contentEl = contentRef.value

  if (!contentEl) {
    return
  }

  alignRight.value = false

  await nextTick()

  const rect = contentEl.getBoundingClientRect()
  const viewportWidth = window.innerWidth

  alignRight.value = rect.right > viewportWidth

  await updateOverflowState()
}

const updateDropdownState = async () => {
  await updateDropdownPosition()
  await updateOverflowState()
}

const toggle = async () => {
  if (props.disabled) {
    return
  }

  isOpen.value = !isOpen.value

  if (isOpen.value) {
    await updateDropdownState()
    return
  }

  alignRight.value = false
  hasOverflow.value = false
}

const close = () => {
  isOpen.value = false
  alignRight.value = false
  hasOverflow.value = false
}

const onClickOutside = event => {
  if (!props.closeOnOutside) {
    return
  }

  if (!dropdownRef.value) {
    return
  }

  if (!dropdownRef.value.contains(event.target)) {
    close()
  }
}

const onKeydown = event => {
  if (!props.closeOnEscape) {
    return
  }

  if (event.key === 'Escape') {
    close()
  }
}

const onResize = () => {
  updateDropdownState()
}

watch(
  () => props.defaultOpen,
  async value => {
    isOpen.value = value

    if (value) {
      await updateDropdownState()
      return
    }

    alignRight.value = false
    hasOverflow.value = false
  },
)

watch(isOpen, async value => {
  if (value) {
    await updateDropdownState()
    return
  }

  alignRight.value = false
  hasOverflow.value = false
})

onMounted(async () => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('keydown', onKeydown)
  window.addEventListener('resize', onResize)

  if (window.ResizeObserver && contentRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateDropdownState()
    })

    resizeObserver.observe(contentRef.value)

    if (optionsRef.value) {
      resizeObserver.observe(optionsRef.value)
    }
  }

  if (window.MutationObserver && optionsRef.value) {
    mutationObserver = new MutationObserver(() => {
      updateDropdownState()
    })

    mutationObserver.observe(optionsRef.value, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }

  if (isOpen.value) {
    await updateDropdownState()
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
  window.removeEventListener('resize', onResize)

  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-dropdown {
  position: relative;
  width: 100%;

  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &_open {
    .base-dropdown__wrapper {
      border-color: var(--hint-primary-color);
    }

    .base-dropdown__caret {
      color: var(--hint-primary-color);
    }
  }

  &__wrapper {
    position: relative;
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 10px;

    @include adaptiveValue('min-height', 50, 40);
    @include adaptiveValue('padding-left', 18, 15);
    @include adaptiveValue('padding-right', 18, 15);
    @include adaptiveValue('border-radius', 20, 10);

    border: 1px solid var(--border-primary-color);

    background-color: var(--bg-secondary-color);
    color: var(--primary-color);

    outline: none;
    cursor: pointer;

    transition:
      border-color 0.3s ease,
      background-color 0.3s ease,
      color 0.3s ease;

    &:focus-visible {
      border-color: var(--hint-primary-color);
    }

    @media (any-hover: hover) {
      &:hover {
        border-color: var(--hint-primary-color);

        .base-dropdown__caret {
          color: var(--primary-color);
        }
      }
    }
  }

  &__label {
    flex: 1 1 auto;
    min-width: 0;

    overflow: hidden;

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 120%;

    color: var(--primary-color);

    text-align: left;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__caret {
    pointer-events: none;

    flex: 0 0 auto;

    width: 15px;
    min-width: 15px;
    height: 8px;

    display: flex;
    align-items: center;
    justify-content: center;

    color: var(--hint-primary-color);

    transition: color 0.3s ease;
  }

  &__caret-icon {
    width: 15px;
    min-width: 15px;
    height: 8px;

    color: inherit;

    transition: transform 0.3s ease;

    :deep(svg) {
      display: block;
      width: 100%;
      height: 100%;
    }

    :deep(path) {
      stroke: currentColor;
    }

    &.is-open {
      transform: rotate(180deg);
    }
  }

  &__list {
    width: 100%;
    min-width: 100%;
    max-height: 300px;

    padding: 10px;

    @include adaptiveValue('border-radius', 20, 10);

    background-color: var(--bg-secondary-color);
    border: 1px solid var(--border-primary-color);

    overflow-x: hidden;
    overflow-y: auto;

    z-index: var(--header-z-index);

    transform-origin: top;

    scrollbar-width: thin;
    scrollbar-color: var(--hint-primary-color) var(--bg-secondary-color);

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background-color: var(--bg-secondary-color);
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--hint-primary-color);
      border-radius: 10px;
    }

    &:not(.absolute) {
      margin-top: 5px;
    }

    &.absolute {
      position: absolute;
      top: calc(100% + 3px);
      left: 0;

      width: 100%;
      min-width: 100%;
    }

    &.overflow {
      border-top-right-radius: 10px;
      border-bottom-right-radius: 10px;
    }
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  :deep(.base-checkbox) {
    width: 100%;
    min-height: 40px;

    display: flex;
    align-items: center;

    padding: 10px;

    @include adaptiveValue('border-radius', 20, 10);

    border: 1px solid transparent;

    background-color: transparent;
    color: var(--primary-color);

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease,
      border-color 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-primary-color);
        border-color: var(--hint-primary-color);
        color: var(--primary-color);
      }
    }
  }

  :deep(.base-checkbox.is-checked) {
    background-color: var(--bg-primary-color);
    border-color: var(--hint-primary-color);
    color: var(--primary-color);
  }

  :deep(.base-checkbox__row) {
    width: 100%;

    display: flex;
    align-items: center;

    gap: 10px;
  }

  :deep(.base-checkbox__box) {
    flex: 0 0 auto;
  }

  :deep(.base-checkbox__label) {
    flex: 1 1 auto;
    min-width: 0;

    overflow: hidden;

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 120%;

    color: inherit;

    white-space: nowrap;
    text-overflow: ellipsis;
  }
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.dropdown-fade-enter-to,
.dropdown-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>

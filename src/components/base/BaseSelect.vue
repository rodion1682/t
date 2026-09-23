<template>
  <div
    ref="rootRef"
    class="base-select-wrap"
    :class="{ 'is-disabled': disabled || loading }"
  >
    <div
      v-if="label"
      class="base-select__field-label"
      :class="{ 'has-error': !!error }"
    >
      {{ label }}:
    </div>

    <div
      :id="id"
      class="base-select"
      :class="containerClasses"
      tabindex="0"
      role="combobox"
      :aria-expanded="isOpen"
      :aria-disabled="disabled || loading"
      @click="toggle"
      @keydown="onKeydown"
    >
      <div class="base-select__value">
        <template v-if="hasValue">
          <span v-if="selectedOption?.icon" class="base-select__icon-wrapper">
            <SvgIcon :icon="selectedOption.icon" class="base-select__icon" />
          </span>

          <span class="base-select__value-text">
            {{ displayValue }}
          </span>
        </template>

        <span v-else-if="placeholder" class="base-select__placeholder">
          {{ placeholder }}
        </span>
      </div>

      <span class="base-select__caret">
        <span v-if="loading" class="base-select__spinner" />

        <SvgIcon
          v-else
          :icon="ChevronDownIcon"
          class="base-select__caret-icon"
          :class="{ 'is-open': isOpen }"
        />
      </span>
    </div>

    <Transition name="select-fade">
      <div
        v-show="isOpen"
        ref="dropdownRef"
        class="base-select__dropdown"
        :class="{ overflow: hasOverflow }"
        role="listbox"
      >
        <div ref="listRef" class="base-select__options">
          <button
            v-for="(option, index) in options"
            :key="String(option[optionValue])"
            type="button"
            class="base-select__option"
            :class="{
              'is-active': index === selectedIndex,
              'is-selected': isSelected(option),
            }"
            :data-index="index"
            role="option"
            :aria-selected="isSelected(option)"
            @mouseenter="selectedIndex = index"
            @click.stop="selectOption(option)"
          >
            <SvgIcon
              v-if="option.icon"
              :icon="option.icon"
              class="base-select__option-icon"
            />

            <span class="base-select__option-label">
              {{ option[optionLabel] }}
            </span>
          </button>

          <div v-if="!options.length" class="base-select__empty">
            {{ $t('No options available') }}
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="error" class="base-select__error _text-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  optionLabel: {
    type: String,
    default: 'label',
  },
  optionValue: {
    type: String,
    default: 'value',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  label: {
    type: String,
    default: '',
  },
  error: {
    type: String,
    default: '',
  },
  regular: {
    type: Boolean,
    default: false,
  },
  id: {
    type: String,
    default: () => `select-${Math.random().toString(36).substring(2, 9)}`,
  },
})

const emit = defineEmits(['update:modelValue'])

const rootRef = ref(null)
const dropdownRef = ref(null)
const listRef = ref(null)

const isOpen = ref(false)
const selectedIndex = ref(-1)
const hasOverflow = ref(false)

let resizeObserver = null
let mutationObserver = null

const selectedOption = computed(() => {
  if (
    props.modelValue === '' ||
    props.modelValue === null ||
    props.modelValue === undefined
  ) {
    return null
  }

  return (
    props.options.find(option => {
      return String(option?.[props.optionValue]) === String(props.modelValue)
    }) || null
  )
})

const hasValue = computed(() => {
  return !!selectedOption.value
})

const displayValue = computed(() => {
  if (!selectedOption.value) {
    return ''
  }

  return String(selectedOption.value?.[props.optionLabel] ?? '')
})

const containerClasses = computed(() => ({
  'is-open': isOpen.value,
  'is-filled': hasValue.value,
  'has-error': !!props.error,
  'is-disabled': props.disabled || props.loading,
  regular: props.regular,
}))

const isSelected = option => {
  return String(option?.[props.optionValue]) === String(props.modelValue)
}

const updateOverflowState = async () => {
  await nextTick()

  const dropdown = dropdownRef.value

  if (!dropdown || !isOpen.value) {
    hasOverflow.value = false
    return
  }

  hasOverflow.value = dropdown.scrollHeight > dropdown.clientHeight + 1
}

const scrollActiveIntoView = async () => {
  await nextTick()

  if (!listRef.value || selectedIndex.value < 0) {
    return
  }

  const element = listRef.value.querySelector(
    `[data-index="${selectedIndex.value}"]`,
  )

  element?.scrollIntoView({
    block: 'nearest',
  })
}

const open = async () => {
  if (props.disabled || props.loading || !props.options.length) {
    return
  }

  isOpen.value = true

  const index = props.options.findIndex(option => isSelected(option))

  selectedIndex.value = index >= 0 ? index : props.options.length ? 0 : -1

  await nextTick()
  await updateOverflowState()
  await scrollActiveIntoView()
}

const close = () => {
  isOpen.value = false
  selectedIndex.value = -1
  hasOverflow.value = false
}

const toggle = async () => {
  if (props.disabled || props.loading) {
    return
  }

  if (isOpen.value) {
    close()
    return
  }

  await open()
}

const selectOption = option => {
  if (!option) {
    return
  }

  emit('update:modelValue', option[props.optionValue])

  close()
}

const onClickOutside = event => {
  if (!rootRef.value) {
    return
  }

  if (!rootRef.value.contains(event.target)) {
    close()
  }
}

const onKeydownGlobal = event => {
  if (!isOpen.value) {
    return
  }

  if (event.key === 'Escape') {
    close()
  }
}

const onKeydown = async event => {
  if (props.disabled || props.loading) {
    return
  }

  switch (event.key) {
    case 'Enter':
    case ' ':
      event.preventDefault()

      if (!isOpen.value) {
        await open()
        return
      }

      if (selectedIndex.value >= 0 && props.options[selectedIndex.value]) {
        selectOption(props.options[selectedIndex.value])
      }

      break

    case 'ArrowDown':
      event.preventDefault()

      if (!isOpen.value) {
        await open()
        return
      }

      selectedIndex.value = Math.min(
        selectedIndex.value + 1,
        props.options.length - 1,
      )

      await scrollActiveIntoView()

      break

    case 'ArrowUp':
      event.preventDefault()

      if (!isOpen.value) {
        await open()
        return
      }

      selectedIndex.value = Math.max(selectedIndex.value - 1, 0)

      await scrollActiveIntoView()

      break

    case 'Escape':
      event.preventDefault()
      close()
      break
  }
}

const onResize = () => {
  updateOverflowState()
}

watch(
  () => props.disabled,
  value => {
    if (value) {
      close()
    }
  },
)

watch(
  () => props.loading,
  value => {
    if (value) {
      close()
    }
  },
)

watch(
  () => props.options,
  async () => {
    if (isOpen.value) {
      await updateOverflowState()
    }
  },
  {
    deep: true,
  },
)

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)

  document.addEventListener('keydown', onKeydownGlobal)

  window.addEventListener('resize', onResize)

  if (window.ResizeObserver && dropdownRef.value) {
    resizeObserver = new ResizeObserver(() => {
      updateOverflowState()
    })

    resizeObserver.observe(dropdownRef.value)
  }

  if (window.MutationObserver && listRef.value) {
    mutationObserver = new MutationObserver(() => {
      updateOverflowState()
    })

    mutationObserver.observe(listRef.value, {
      childList: true,
      subtree: true,
      characterData: true,
    })
  }
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', onClickOutside)

  document.removeEventListener('keydown', onKeydownGlobal)

  window.removeEventListener('resize', onResize)

  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.base-select-wrap {
  position: relative;
  width: 100%;

  &.is-disabled {
    opacity: 0.5;
  }
}

.base-select {
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

  &.is-open {
    border-color: var(--hint-primary-color);

    .base-select__caret {
      color: var(--hint-primary-color);
    }
  }

  &.has-error {
    border-color: var(--error-color);
  }

  &.is-disabled {
    pointer-events: none;
    cursor: not-allowed;
  }

  &:focus-visible {
    border-color: var(--hint-primary-color);
  }

  @media (any-hover: hover) {
    &:hover:not(.is-disabled) {
      border-color: var(--hint-primary-color);

      .base-select__caret {
        color: var(--primary-color);
      }
    }
  }

  &__field-label {
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 120%;

    color: var(--secondary-color);

    transition: color 0.3s ease;

    &:not(:last-child) {
      margin-bottom: 5px;
    }

    &.has-error {
      color: var(--error-color);
    }
  }

  &__value {
    flex: 1 1 auto;
    min-width: 0;

    display: flex;
    align-items: center;

    gap: 8px;

    overflow: hidden;

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 120%;

    color: var(--primary-color);
  }

  &__value-text,
  &__placeholder {
    display: block;

    min-width: 0;

    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__placeholder {
    color: var(--secondary-color);
  }

  &__icon-wrapper {
    flex: 0 0 auto;

    width: 22px;
    min-width: 22px;
    height: 22px;

    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__icon {
    width: 18px;
    min-width: 18px;
    height: 18px;

    color: var(--primary-color);
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

  &__spinner {
    width: 16px;
    min-width: 16px;
    height: 16px;

    border: 2px solid rgba(#f0eae0, 20%);
    border-top-color: var(--hint-primary-color);
    border-radius: 50%;

    animation: spin 0.8s linear infinite;
  }

  &__dropdown {
    position: absolute;

    top: calc(100% + 3px);
    left: 0;

    z-index: var(--header-z-index);

    width: 100%;
    min-width: 100%;
    max-height: 300px;

    padding: 10px;

    @include adaptiveValue('border-radius', 20, 10);

    background-color: var(--bg-secondary-color);
    border: 1px solid var(--border-primary-color);

    overflow-x: hidden;
    overflow-y: auto;

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

  &__option {
    width: 100%;
    min-height: 40px;

    display: flex;
    align-items: center;

    gap: 10px;

    padding: 10px;

    @include adaptiveValue('border-radius', 20, 10);

    border: 1px solid transparent;

    background-color: transparent;
    color: var(--primary-color);

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 120%;

    text-align: left;

    cursor: pointer;

    transition:
      color 0.3s ease,
      background-color 0.3s ease,
      border-color 0.3s ease;

    &.is-selected {
      background-color: var(--bg-primary-color);
      border-color: var(--hint-primary-color);
      color: var(--primary-color);
    }

    &.is-active:not(.is-selected) {
      background-color: var(--bg-primary-color);
      border-color: var(--hint-primary-color);
      color: var(--primary-color);
    }

    @media (any-hover: hover) {
      &:hover:not(.is-selected) {
        background-color: var(--bg-primary-color);
        border-color: var(--hint-primary-color);
        color: var(--primary-color);
      }
    }
  }

  &__option-icon {
    flex: 0 0 auto;

    width: 18px;
    min-width: 18px;
    height: 18px;

    color: var(--primary-color);
  }

  &__option-label {
    flex: 1 1 auto;
    min-width: 0;

    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
  }

  &__empty {
    min-height: 40px;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 10px;

    color: var(--secondary-color);

    font-family: var(--font-inter);
    font-size: 14px;
    line-height: 120%;

    text-align: center;
  }

  &__error {
    margin-top: 8px;
  }
}

.select-fade-enter-active,
.select-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.select-fade-enter-from,
.select-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.select-fade-enter-to,
.select-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

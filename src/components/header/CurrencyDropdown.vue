<template>
  <div
    v-show="currencyStore.currencyOptions?.length > 1"
    ref="dropdownRef"
    class="currency-select"
  >
    <Multiselect
      v-model="selectedCurrency"
      mode="single"
      :options="currencyStore.currencyOptions"
      trackBy="value"
      label="label"
      :closeOnSelect="true"
      :hideSelected="false"
      :canDeselect="false"
      placeholder=""
      :canClear="false"
      @select="handleCurrencyChange"
      :classes="dropdownClasses"
    >
      <template #singlelabel="{ value }">
        <div class="currency-select__label">
          <div v-if="false" class="currency-select__icon">
            {{ value?.symbol }}
          </div>

          <div class="currency-select__text">
            <div class="currency-select__code">
              {{ value?.code }}
            </div>
          </div>
        </div>
      </template>

      <template #caret="{ handleCaretClick, isOpen }">
        <button
          type="button"
          class="currency-select__caret"
          @click="handleCaretClick"
          :aria-expanded="isOpen"
        >
          <SvgIcon
            :icon="ChevronDownIcon"
            class="currency-select__caret-icon"
            :class="{ 'is-open': isOpen }"
          />
        </button>
      </template>
    </Multiselect>
  </div>
</template>

<script setup>
import { useCurrencyStore } from '@/stores/currency'
import Multiselect from '@vueform/multiselect'
import { computed, ref, watch } from 'vue'
import { ChevronDownIcon } from '../icons'
import SvgIcon from '../icons/SvgIcon.vue'

const props = defineProps({
  isFooter: { type: Boolean, default: false },
})

const currencyStore = useCurrencyStore()
const dropdownRef = ref(null)

const selectedCurrency = computed({
  get: () => currencyStore.currentCurrencyCode,
  set: value => currencyStore.changeCurrency(value),
})

const handleCurrencyChange = async value => {
  if (value !== selectedCurrency.value) {
    await currencyStore.changeCurrency(value)
  }
}

watch(selectedCurrency, (newValue, oldValue) => {
  console.log('[Currency changed]', { from: oldValue, to: newValue })
})

const dropdownClasses = computed(() => ({
  container: 'dropdown',
  containerOpen: 'dropdown_open',
  wrapper: 'dropdown__wrapper',

  singleLabel: 'dropdown__single',
  singleLabelText: 'dropdown__singleText',

  dropdown: `dropdown__list ${props.isFooter ? 'dropdown__list_footer' : ''}`,
  options: 'dropdown__options',
  option: 'dropdown__option',
  optionPointed: 'dropdown__option_pointed',
  optionSelected: 'dropdown__option_selected',
}))
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.currency-select {
  @media (any-hover: hover) {
    &:hover {
      .currency-select__caret {
        color: var(--primary-color);
      }
    }
  }
  &__label {
    pointer-events: none;
    display: flex;
    align-items: center;
    gap: 8px;
    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 120%;
    color: inherit;
  }

  &__code {
    text-transform: uppercase;
  }

  &__caret {
    pointer-events: none;
    color: var(--hint-primary-color);
    width: 15px;
    min-width: 15px;
    height: 8px;
    display: flex;
    align-items: center;
    background-color: transparent;
    justify-content: center;
    &-icon {
      width: 15px;
      min-width: 15px;
      height: 8px;
      color: inherit;
      transform: rotate(0deg);
      svg {
        transition: transform 0.3s ease;
      }

      &.is-open svg {
        transform: rotate(180deg);
      }
    }
  }
}

.dropdown {
  position: relative;
  &_open {
    .dropdown__wrapper {
      background-color: var(--bg-primary-color);
      color: var(--primary-color);
      border-color: var(--hint-primary-color);
    }
  }

  &__wrapper {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    @include adaptiveValue('min-height', 50, 40, 1440, 992, 1);
    padding-top: 5px;
    padding-bottom: 5px;
    @include adaptiveValue('padding-left', 20, 10, 1400, 992, 1);
    @include adaptiveValue('padding-right', 20, 10, 1400, 992, 1);
    @include adaptiveValue('border-radius', 20, 10);
    cursor: pointer;
    transition: all 0.3s ease 0s;
    color: var(--primary-color);
    transition: all 0.3s ease 0s;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-primary-color);
        color: var(--primary-color);
        border-color: var(--hint-primary-color);
      }
    }
    @media (max-width: $md4) {
      min-height: 45px;
      width: 100%;
      border-radius: 20px;
      background-color: var(--bg-secondary-color);
      justify-content: center;
      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }

  &__list {
    position: absolute;
    top: calc(100% + 3px);
    right: 0;
    min-width: 100%;
    padding: 10px;
    @include adaptiveValue('border-radius', 20, 10);
    background-color: var(--bg-secondary-color);
    overflow: hidden;
    z-index: var(--header-z-index);
    transition: all 0.3s ease 0s;
    &.is-hidden {
      opacity: 0;
      visibility: hidden;
      pointer-events: none;
      transform: translateY(-6px);
    }

    &_footer {
      max-height: 200px;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    @media (max-width: $md3) {
      top: calc(100% + 6px);
      width: 100%;
    }
  }

  &__options {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  &__single,
  &__singleText {
    width: 100%;
  }

  &__option {
    cursor: pointer;
    pointer-events: auto;

    display: flex;
    align-items: center;
    justify-content: flex-start;

    min-width: 40px;
    padding: 10px;

    @include adaptiveValue('border-radius', 20, 10);

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 100%;
    text-transform: uppercase;
    color: var(--primary-color);
    border: 1px solid transparent;
    background-color: transparent;
    transition: all 0.3s ease 0s;
    &:not(:last-child) {
      margin-bottom: 2px;
    }
    &_selected {
      background-color: var(--bg-primary-color);
      color: var(--primary-color);
      border-color: var(--hint-primary-color);
      pointer-events: none;
    }

    &_pointed {
    }

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-primary-color);
        color: var(--primary-color);
        border-color: var(--hint-primary-color);
      }
    }

    @media (max-width: $md3) {
      min-height: 45px;
    }
  }
}
</style>

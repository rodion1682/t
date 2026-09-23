<template>
  <div
    v-show="languageStore.languages.length > 1"
    ref="dropdownRef"
    class="language-select"
  >
    <Multiselect
      v-model="selectedLanguage"
      mode="single"
      :options="languageOptions"
      value-prop="value"
      track-by="value"
      label="label"
      :close-on-select="true"
      :hide-selected="false"
      :can-deselect="false"
      :can-clear="false"
      placeholder=""
      :classes="dropdownClasses"
    >
      <template #singlelabel="{ value }">
        <div class="language-select__label">
          <div class="language-select__code">
            {{ value?.code }}
          </div>
        </div>
      </template>

      <template #option="{ option }">
        <div class="language-select__option-content">
          <span class="language-select__option-code">
            {{ option?.code }}
          </span>

          <span v-if="option?.title" class="language-select__option-title">
            {{ option.title }}
          </span>
        </div>
      </template>

      <template #caret="{ handleCaretClick, isOpen }">
        <button
          type="button"
          class="language-select__caret"
          :aria-expanded="isOpen"
          @click="handleCaretClick"
        >
          <SvgIcon
            :icon="ChevronDownIcon"
            class="language-select__caret-icon"
            :class="{ 'is-open': isOpen }"
          />
        </button>
      </template>
    </Multiselect>
  </div>
</template>

<script setup>
import Multiselect from '@vueform/multiselect'
import { computed, onMounted, ref } from 'vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  isFooter: {
    type: Boolean,
    default: false,
  },
})

const languageStore = useLanguageStore()
const dropdownRef = ref(null)

const languageOptions = computed(() =>
  (languageStore.languages || []).map(language => ({
    value: String(language.id),
    label: language.title || language.code,
    title: language.title || '',
    code: String(language.code || '').toUpperCase(),
  })),
)

const selectedLanguage = computed({
  get: () =>
    languageStore.currentLanguageId
      ? String(languageStore.currentLanguageId)
      : null,

  set: value => {
    if (!value) return

    languageStore.changeLanguage(String(value))
  },
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

onMounted(() => {
  languageStore.initializeLanguages()
})
</script>

<style lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.language-select {
  @media (any-hover: hover) {
    &:hover {
      .language-select__caret {
        color: var(--primary-color);
      }
    }
  }

  &__label {
    display: flex;
    align-items: center;
    gap: 8px;

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 120%;
    color: inherit;

    pointer-events: none;
  }

  &__code {
    text-transform: uppercase;
  }

  &__caret {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 15px;
    min-width: 15px;
    height: 8px;
    padding: 0;

    border: 0;
    background-color: transparent;

    color: var(--hint-primary-color);

    pointer-events: none;
  }

  &__caret-icon {
    width: 15px;
    min-width: 15px;
    height: 8px;

    color: inherit;

    svg {
      transform: rotate(0deg);
      transition: transform 0.3s ease;
    }

    &.is-open svg {
      transform: rotate(180deg);
    }
  }

  &__option-content {
    display: flex;
    align-items: center;
    gap: 8px;

    width: 100%;
    min-width: 0;
  }

  &__option-code {
    flex: 0 0 auto;
    text-transform: uppercase;
  }

  &__option-title {
    min-width: 0;
    overflow: hidden;

    white-space: nowrap;
    text-overflow: ellipsis;
    text-transform: none;
  }
}

/*
 * Same dropdown styles as CurrencySelect.
 *
 * If these styles are already global/shared from CurrencySelect,
 * move them into a shared SCSS file instead of duplicating them here.
 */
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

    color: var(--primary-color);

    cursor: pointer;

    transition: all 0.3s ease;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--bg-primary-color);
        color: var(--primary-color);
        border-color: var(--hint-primary-color);
      }
    }

    @media (max-width: $md4) {
      justify-content: center;

      width: 100%;
      min-height: 45px;

      border-radius: 20px;

      background-color: var(--bg-secondary-color);

      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
  }

  &__single,
  &__singleText {
    width: 100%;
  }

  &__list {
    position: absolute;
    top: calc(100% + 3px);
    right: 0;
    z-index: var(--header-z-index);

    min-width: 100%;
    padding: 10px;

    @include adaptiveValue('border-radius', 20, 10);

    background-color: var(--bg-secondary-color);

    overflow: hidden;

    transition: all 0.3s ease;

    &.is-hidden {
      opacity: 0;
      visibility: hidden;
      transform: translateY(-6px);

      pointer-events: none;
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

  &__option {
    display: flex;
    align-items: center;
    justify-content: flex-start;

    min-width: 40px;
    padding: 10px;

    @include adaptiveValue('border-radius', 20, 10);

    border: 1px solid transparent;
    background-color: transparent;

    font-family: var(--font-inter);
    font-size: 16px;
    font-weight: 400;
    line-height: 100%;
    color: var(--primary-color);

    cursor: pointer;
    pointer-events: auto;

    transition: all 0.3s ease;

    &:not(:last-child) {
      margin-bottom: 2px;
    }

    &_selected {
      background-color: var(--bg-primary-color);
      color: var(--primary-color);
      border-color: var(--hint-primary-color);

      pointer-events: none;
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

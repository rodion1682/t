<template>
  <div
    v-if="languageStore.languages?.length > 1"
    ref="dropdownRef"
    class="language-select"
  >
    <Multiselect
      v-model="selectedLanguage"
      mode="single"
      :options="languageOptions"
      track-by="value"
      label="label"
      :close-on-select="true"
      :hide-selected="false"
      :can-deselect="false"
      placeholder=""
      :can-clear="false"
      @select="handleLanguageChange"
      :classes="dropdownClasses"
    >
      <template #singlelabel="{ value }">
        <div class="language-select__label">
          <div class="language-select__text">
            <div class="language-select__code">
              {{ value?.code }}
            </div>
          </div>
        </div>
      </template>

      <template #option="{ option }">
        <div class="language-select__option">
          {{ option?.title || option?.label }}
        </div>
      </template>

      <template #caret="{ handleCaretClick, isOpen }">
        <button
          type="button"
          class="language-select__caret"
          @click="handleCaretClick"
          :aria-expanded="isOpen"
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
import { computed, ref, watch } from 'vue'

import { ChevronDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useLanguageStore } from '@/stores/language'

const props = defineProps({
  isFooter: { type: Boolean, default: false },
})

const languageStore = useLanguageStore()
const dropdownRef = ref(null)

const languageOptions = computed(() =>
  languageStore.languages.map(lang => ({
    ...lang,
    label: lang.code?.toUpperCase() || lang.title,
    value: lang.id.toString(),
  })),
)

const selectedLanguage = computed({
  get: () => languageStore.currentLanguageId,
  set: value => languageStore.changeLanguage(value),
})

const handleLanguageChange = async value => {
  if (value !== selectedLanguage.value) {
    await languageStore.changeLanguage(value)
  }
}

watch(selectedLanguage, (newValue, oldValue) => {
  console.log('[Language changed]', { from: oldValue, to: newValue })
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

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.language-select {
  @media (max-width: $md6) {
    width: 100%;
  }

  &__label {
    pointer-events: none;
    display: flex;
    align-items: center;
    font-weight: 500;
    font-family: var(--font-inter);
    @include adaptiveValue('font-size', 16);

    @media (min-width: $md5) or (max-width: $md6) {
      gap: 8px;
    }

    @media (max-width: $md6) {
      margin-left: auto;
      margin-right: auto;
    }
  }

  &__text {
  }

  &__code {
    font-weight: 400;
    text-transform: uppercase;
  }

  &__option {
    width: 100%;
  }

  &__caret {
    pointer-events: none;
    display: inline-flex;
    align-items: center;
    background-color: transparent;
    color: inherit;

    &-icon {
      @include adaptiveValue('width', 10, 10, 1920);
      @include adaptiveValue('height', 10, 10, 1920);
      color: inherit;

      svg {
        transform: rotate(0deg);
        transition: transform 0.3s ease 0s;
      }

      &.is-open {
        svg {
          transform: rotate(180deg);
        }
      }
    }
  }
}

.dropdown {
  position: relative;

  &_open {
    .dropdown__wrapper {
      color: var(--primary-color);
      border-color: var(--hint-color);
    }
  }

  &__wrapper {
    font-weight: 400;
    background-color: transparent;
    transition: all 0.3s ease 0s;
    background-color: rgb(255, 255, 255, 0.05);
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    border-style: solid;
    border-color: rgb(255, 255, 255, 0.25);

    @include adaptiveValue('padding-top', 8, 5);
    @include adaptiveValue('padding-bottom', 8, 5);
    @include adaptiveValue('padding-left', 15, 10);
    @include adaptiveValue('padding-right', 15, 10);
    @include adaptiveValue('font-size', 14);
    @include adaptiveValue('border-width', 1);
    @include adaptiveValue('min-height', 34);
    @include adaptiveValue('min-width', 83);
    @include adaptiveValue('border-radius', 4);

    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
        border-color: var(--hint-color);
      }
    }

    @media (max-width: $md5) {
      justify-content: space-between;
    }
  }

  &__list {
    position: absolute;
    right: 0;
    @include adaptiveValue('top', 54, 44);
    min-width: 100%;
    background-color: var(--bg-primary-color);
    @include adaptiveValue('border-radius', 8);
    transition: all 0.3s ease 0s;
    z-index: var(--header-z-index);

    &.is-hidden {
      @include hide-item;

      .dropdown__option {
        @include hide-item;
      }
    }

    @media (max-width: $md6) {
      position: relative;
    }

    &_footer {
      @include adaptiveValue('max-height', 200);
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }
  }

  &__single,
  &__singleText {
    width: 100%;
  }

  &__option {
    cursor: pointer;
    font-weight: 700;
    transition: color 0.3s ease 0s;
    pointer-events: auto;
    @include adaptiveValue('border-radius', 6);
    @include adaptiveValue('padding-top', 6);
    @include adaptiveValue('padding-bottom', 6);
    @include adaptiveValue('padding-left', 10);
    @include adaptiveValue('padding-right', 10);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 3);
    }

    &_selected {
      color: var(--primary-color);
      background-color: var(--hint-color);
      pointer-events: none;
    }

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-color);
      }
    }

    @media (max-width: $md6) {
      text-align: center;
      padding: 10px;
      min-height: 46px;
      display: flex;
      align-content: center;
      justify-content: center;
      border-bottom: 1px solid var(--border-color);

      span {
        display: flex;
        align-items: center;
        line-height: 1;
      }
    }
  }
}
</style>

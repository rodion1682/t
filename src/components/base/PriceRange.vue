<template>
  <div class="price-range">
    <div class="price-range__field">
      <BaseInput
        class="price-range__input"
        :model-value="min"
        type="text"
        :placeholder="placeholderMin"
        :disabled="disabled"
        inputmode="numeric"
        autocomplete="off"
        @update:modelValue="onMinInput"
        @blur="emitChange"
        @enter="emitChange"
      >
        <template #suffix>
          <div
            v-if="internalCurrencyImage"
            class="price-range__icon _ibg-contain"
          >
            <img :src="internalCurrencyImage" :alt="internalCurrencyAlt" />
          </div>
        </template>
      </BaseInput>
    </div>

    <span>-</span>

    <div class="price-range__field">
      <BaseInput
        class="price-range__input"
        :model-value="max"
        type="text"
        :placeholder="placeholderMax"
        :disabled="disabled"
        inputmode="numeric"
        autocomplete="off"
        @update:modelValue="onMaxInput"
        @blur="emitChange"
        @enter="emitChange"
      >
        <template #suffix>
          <div
            v-if="internalCurrencyImage"
            class="price-range__icon _ibg-contain"
          >
            <img :src="internalCurrencyImage" :alt="internalCurrencyAlt" />
          </div>
        </template>
      </BaseInput>
    </div>
  </div>
</template>

<script setup>
import BaseInput from '@/components/base/BaseInput.vue'
import { useSettingsStore } from '@/stores/settings'
import { computed } from 'vue'

const settingsStore = useSettingsStore()

const props = defineProps({
  min: { type: [String, Number], default: '' },
  max: { type: [String, Number], default: '' },

  placeholderMin: { type: String, default: '0' },
  placeholderMax: { type: String, default: '15000' },

  currencySymbol: { type: String, default: '€' },

  minLimit: { type: Number, default: null },
  maxLimit: { type: Number, default: null },

  disabled: { type: Boolean, default: false },
})

const emit = defineEmits(['update:min', 'update:max', 'change'])

const internalCurrency = computed(() => {
  return settingsStore.internalCurrency || {}
})

const internalCurrencyImage = computed(() => {
  return internalCurrency.value?.image || ''
})

const internalCurrencyAlt = computed(() => {
  return internalCurrency.value?.name || 'Internal currency'
})

const sanitize = value => {
  return String(value ?? '').replace(/[^\d]/g, '')
}

const clamp = value => {
  if (value === '') return ''

  let numeric = Number(value)

  if (props.minLimit !== null && numeric < props.minLimit) {
    numeric = props.minLimit
  }

  if (props.maxLimit !== null && numeric > props.maxLimit) {
    numeric = props.maxLimit
  }

  return String(numeric)
}

const normalize = value => {
  return clamp(sanitize(value))
}

const onMinInput = value => {
  const normalized = normalize(value)

  emit('update:min', normalized)
  emit('change', {
    min: normalized,
    max: String(props.max ?? ''),
  })
}

const onMaxInput = value => {
  const normalized = normalize(value)

  emit('update:max', normalized)
  emit('change', {
    min: String(props.min ?? ''),
    max: normalized,
  })
}

const emitChange = () => {
  emit('change', {
    min: String(props.min ?? ''),
    max: String(props.max ?? ''),
  })
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.price-range {
  display: flex;
  align-items: center;
  gap: 8px;

  &__field {
    flex: 1 1 50%;
    @media (min-width: $md3) {
      max-width: 117px;
    }
  }

  &__input {
    width: 100%;
  }

  &__icon {
    min-width: 16px;
    width: 16px;
    height: 16px;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
}
</style>

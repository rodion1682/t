<template>
  <aside class="aside">
    <div class="aside__title _h4">
      <span>{{ $t('Filters') }}</span>
    </div>
    <div class="aside__control">
      <BaseInput
        v-model="searchValue"
        class="aside__search"
        :placeholder="$t('Search ...')"
        autocomplete="off"
      >
        <template #suffix>
          <SvgIcon class="aside__search-icon" :icon="SearchIcon" />
        </template>
      </BaseInput>
    </div>
    <div class="aside__control">
      <BaseDdropdown
        class="aside__dropdown"
        :label="sortDropdownLabel"
        absolute
      >
        <BaseCheckbox
          v-for="option in sortOptions"
          :key="option.value"
          class="aside__checkbox"
          :model-value="safeFilters.sort === option.value"
          @update:model-value="selectSort(option.value)"
        >
          {{ option.label }}
        </BaseCheckbox>
      </BaseDdropdown>
    </div>
    <div class="aside__control">
      <div class="aside__subtitle">
        {{ $t('Price') }}
      </div>

      <PriceRange
        v-model:min="minPrice"
        v-model:max="maxPrice"
        class="aside__price"
        :currency-symbol="currencyStore.currentCurrencySymbol"
        placeholder-min="0"
        placeholder-max="10000"
        @change="handlePriceRangeChange"
      />
    </div>
    <div class="aside__control">
      <div class="aside__subtitle">
        {{ $t('Item type') }}
      </div>

      <div v-if="typeOptions.length" class="aside__box">
        <BaseCheckbox
          variant="radio"
          class="aside__checkbox"
          :model-value="
            !safeFilters.type.length && !safeFilters.subcategories.length
          "
          @update:model-value="clearTypes"
        >
          {{ $t('All') }}
        </BaseCheckbox>
        <BaseCheckbox
          variant="radio"
          v-for="option in typeOptions"
          :key="option.value"
          class="aside__checkbox"
          :model-value="isTypeChecked(option)"
          @update:model-value="toggleType(option)"
        >
          {{ decodeHtml(option.label) }}
        </BaseCheckbox>
      </div>
    </div>
    <BaseDdropdown
      v-if="typeOptions.length && false"
      class="aside__dropdown"
      :label="typeDropdownLabel"
      :close-on-outside="false"
      :close-on-escape="false"
    >
      <BaseCheckbox
        class="aside__checkbox"
        :model-value="
          !safeFilters.type.length && !safeFilters.subcategories.length
        "
        @update:model-value="clearTypes"
      >
        {{ $t('All') }}
      </BaseCheckbox>

      <BaseCheckbox
        v-for="option in typeOptions"
        :key="option.value"
        class="aside__checkbox"
        :model-value="isTypeChecked(option)"
        @update:model-value="toggleType(option)"
      >
        {{ decodeHtml(option.label) }}
      </BaseCheckbox>
    </BaseDdropdown>
    <BaseDdropdown
      v-if="showHeroesFilter"
      class="aside__dropdown"
      :label="heroDropdownLabel"
      :close-on-outside="false"
      :close-on-escape="false"
    >
      <BaseCheckbox
        v-for="option in safeAvailableFilters.heroes"
        :key="option.value"
        class="aside__checkbox"
        :model-value="safeFilters.hero.includes(option.value)"
        @update:model-value="toggleMulti('hero', option.value)"
      >
        {{ decodeHtml(option.label) }}
      </BaseCheckbox>
    </BaseDdropdown>

    <template v-if="showCs2ExteriorFilter">
      <div class="aside__control">
        <div class="aside__subtitle">
          {{ $t('Quality:') }}
        </div>
        <div class="aside__box">
          <BaseCheckbox
            variant="radio"
            class="aside__checkbox"
            :model-value="!selectedCs2ExteriorValues.length"
            @update:model-value="clearCs2Exterior"
          >
            {{ $t('All') }}
          </BaseCheckbox>

          <BaseCheckbox
            variant="radio"
            v-for="option in cs2ExteriorOptions"
            :key="option.value"
            class="aside__checkbox"
            :model-value="selectedCs2ExteriorValues.includes(option.value)"
            @update:model-value="toggleCs2Exterior(option.value)"
          >
            {{ decodeHtml(option.label) }}
          </BaseCheckbox>
        </div>
        <BaseDdropdown
          v-if="false"
          class="aside__dropdown"
          :label="exteriorDropdownLabel"
          :close-on-outside="false"
          :close-on-escape="false"
        >
          <BaseCheckbox
            class="aside__checkbox"
            :model-value="!selectedCs2ExteriorValues.length"
            @update:model-value="clearCs2Exterior"
          >
            {{ $t('All') }}
          </BaseCheckbox>

          <BaseCheckbox
            v-for="option in cs2ExteriorOptions"
            :key="option.value"
            class="aside__checkbox"
            :model-value="selectedCs2ExteriorValues.includes(option.value)"
            @update:model-value="toggleCs2Exterior(option.value)"
          >
            {{ decodeHtml(option.label) }}
          </BaseCheckbox>
        </BaseDdropdown>
      </div>
    </template>

    <template v-if="showDotaQualityFilter">
      <div class="aside__subtitle">
        {{ $t('Rarity') }}
      </div>

      <BaseDdropdown
        class="aside__dropdown"
        :label="rarityDropdownLabel"
        :close-on-outside="false"
        :close-on-escape="false"
      >
        <BaseCheckbox
          class="aside__checkbox"
          :model-value="!safeFilters.quality.length"
          @update:model-value="clearMulti('quality')"
        >
          {{ $t('All') }}
        </BaseCheckbox>

        <BaseCheckbox
          v-for="option in safeAvailableFilters.qualities"
          :key="option.value"
          class="aside__checkbox"
          :model-value="safeFilters.quality.includes(option.value)"
          @update:model-value="toggleMulti('quality', option.value)"
        >
          {{ decodeHtml(option.label) }}
        </BaseCheckbox>
      </BaseDdropdown>
    </template>
    <BaseDdropdown
      v-if="false"
      class="aside__dropdown"
      :label="$t('Special offers')"
      :close-on-outside="false"
      :close-on-escape="false"
    >
      <BaseCheckbox
        v-for="option in specialOfferOptions"
        :key="option.value"
        class="aside__checkbox"
        :model-value="safeFilters.special_offer === option.value"
        @update:model-value="toggleSingle('special_offer', option.value)"
      >
        {{ $t(option.label) }}
      </BaseCheckbox>
    </BaseDdropdown>

    <BaseButton
      type="button"
      variant="transparent-link"
      class="aside__reset"
      @click="handleResetFilters"
    >
      {{ $t('Clear filters') }}
    </BaseButton>
  </aside>
</template>

<script setup>
import { debounce } from 'lodash'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import BaseButton from '@/components/base/BaseButton.vue'
import BaseCheckbox from '@/components/base/BaseCheckbox.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import PriceRange from '@/components/base/PriceRange.vue'
import BaseDdropdown from '@/components/dropdown/BaseDdropdown.vue'
import { SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useCurrencyStore } from '@/stores/currency'

const { t } = useI18n()

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({}),
  },
  availableFilters: {
    type: Object,
    default: () => ({}),
  },
  currentGame: {
    type: String,
    default: 'cs2',
  },
  updateFilters: {
    type: Function,
    required: true,
  },
  resetFilters: {
    type: Function,
    required: true,
  },
})

const currencyStore = useCurrencyStore()

const searchValue = ref('')
const minPrice = ref('')
const maxPrice = ref('')

const sortOptions = computed(() => [
  {
    value: 'desc',
    label: t('From high to low'),
  },
  {
    value: 'asc',
    label: t('From low to high'),
  },
])

const specialOfferOptions = computed(() => [
  {
    value: 'sale',
    label: t('Sale'),
  },
  {
    value: 'new',
    label: t('New'),
  },
])

const safeFilters = computed(() => ({
  search: props.filters?.search || '',
  sort: props.filters?.sort || 'desc',

  type: Array.isArray(props.filters?.type) ? props.filters.type : [],

  quality: Array.isArray(props.filters?.quality) ? props.filters.quality : [],

  subcategories: Array.isArray(props.filters?.subcategories)
    ? props.filters.subcategories
    : [],

  hero: Array.isArray(props.filters?.hero) ? props.filters.hero : [],

  exterior_name: Array.isArray(props.filters?.exterior_name)
    ? props.filters.exterior_name
    : [],

  special_offer: props.filters?.special_offer || '',

  priceRange: props.filters?.priceRange || {
    min: null,
    max: null,
  },
}))

const safeAvailableFilters = computed(() => ({
  types: Array.isArray(props.availableFilters?.types)
    ? props.availableFilters.types
    : [],

  qualities: Array.isArray(props.availableFilters?.qualities)
    ? props.availableFilters.qualities
    : [],

  heroes: Array.isArray(props.availableFilters?.heroes)
    ? props.availableFilters.heroes
    : [],

  exterior_names: Array.isArray(props.availableFilters?.exterior_names)
    ? props.availableFilters.exterior_names
    : [],

  subcategories: Array.isArray(props.availableFilters?.subcategories)
    ? props.availableFilters.subcategories
    : [],
}))

const normalizedCurrentGame = computed(() => {
  return String(props.currentGame || '')
    .trim()
    .toLowerCase()
})

const isCs2 = computed(() => {
  return normalizedCurrentGame.value === 'cs2'
})

const isDota2 = computed(() => {
  return normalizedCurrentGame.value === 'dota2'
})

const showHeroesFilter = computed(() => {
  return isDota2.value && safeAvailableFilters.value.heroes.length > 0
})

const cs2UsesExteriorNames = computed(() => {
  return safeAvailableFilters.value.exterior_names.length > 0
})

const cs2ExteriorOptions = computed(() => {
  if (cs2UsesExteriorNames.value) {
    return safeAvailableFilters.value.exterior_names
  }

  return safeAvailableFilters.value.qualities
})

const cs2ExteriorFilterKey = computed(() => {
  return cs2UsesExteriorNames.value ? 'exterior_name' : 'quality'
})

const selectedCs2ExteriorValues = computed(() => {
  return safeFilters.value[cs2ExteriorFilterKey.value] || []
})

const showCs2ExteriorFilter = computed(() => {
  return isCs2.value && cs2ExteriorOptions.value.length > 0
})

const showDotaQualityFilter = computed(() => {
  return isDota2.value && safeAvailableFilters.value.qualities.length > 0
})

const typeOptions = computed(() => {
  if (isCs2.value) {
    return safeAvailableFilters.value.subcategories.map(item => ({
      label: item.category,
      value: item.category,
      subcategories: item.sub_categories || [],
      isCs2Category: true,
    }))
  }

  return safeAvailableFilters.value.types
})

const debouncedSearch = debounce(async value => {
  await props.updateFilters({
    search: value.trim(),
    page: 1,
  })
}, 400)

watch(searchValue, value => {
  if (value === safeFilters.value.search) {
    return
  }

  debouncedSearch(value)
})

watch(
  () => safeFilters.value.search,
  value => {
    if (searchValue.value !== value) {
      searchValue.value = value || ''
    }
  },
  {
    immediate: true,
  },
)

const sortDropdownLabel = computed(() => {
  const option = sortOptions.value.find(
    item => item.value === safeFilters.value.sort,
  )

  return option?.label || t('Sort by price')
})

const selectSort = async value => {
  if (safeFilters.value.sort === value) {
    return
  }

  await props.updateFilters({
    sort: value,
    page: 1,
  })
}

const decodeHtml = value => {
  if (typeof document === 'undefined') {
    return value || ''
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = value || ''

  return textarea.value
}

const toggleSingle = async (key, value) => {
  const current = safeFilters.value[key]

  await props.updateFilters({
    [key]: current === value ? '' : value,
    page: 1,
  })
}

const toggleMulti = async (key, value) => {
  const current = [...(safeFilters.value[key] || [])]
  const index = current.indexOf(value)

  if (index > -1) {
    current.splice(index, 1)
  } else {
    current.push(value)
  }

  await props.updateFilters({
    [key]: current,
    page: 1,
  })
}

const clearMulti = async key => {
  await props.updateFilters({
    [key]: [],
    page: 1,
  })
}

const toggleCs2Exterior = async value => {
  await toggleMulti(cs2ExteriorFilterKey.value, value)
}

const clearCs2Exterior = async () => {
  await props.updateFilters({
    quality: [],
    exterior_name: [],
    page: 1,
  })
}

const isTypeChecked = option => {
  return safeFilters.value.type.includes(option.value)
}

const toggleType = async option => {
  await toggleMulti('type', option.value)
}

const clearTypes = async () => {
  await props.updateFilters({
    type: [],
    subcategories: [],
    page: 1,
  })
}

const typeDropdownLabel = computed(() => {
  const selected = safeFilters.value.type

  if (!selected.length) {
    return t('All')
  }

  if (selected.length === 1) {
    return decodeHtml(selected[0])
  }

  return `${selected.length} ${t('selected')}`
})

const heroDropdownLabel = computed(() => {
  const selected = safeFilters.value.hero

  if (!selected.length) {
    return t('All')
  }

  if (selected.length === 1) {
    const option = safeAvailableFilters.value.heroes.find(
      item => item.value === selected[0],
    )

    return decodeHtml(option?.label || selected[0])
  }

  return `${selected.length} ${t('selected')}`
})

const exteriorDropdownLabel = computed(() => {
  const selected = selectedCs2ExteriorValues.value

  if (!selected.length) {
    return t('All')
  }

  if (selected.length === 1) {
    const option = cs2ExteriorOptions.value.find(
      item => item.value === selected[0],
    )

    return decodeHtml(option?.label || selected[0])
  }

  return `${selected.length} ${t('selected')}`
})

const rarityDropdownLabel = computed(() => {
  const selected = safeFilters.value.quality

  if (!selected.length) {
    return t('All')
  }

  if (selected.length === 1) {
    const option = safeAvailableFilters.value.qualities.find(
      item => item.value === selected[0],
    )

    return decodeHtml(option?.label || selected[0])
  }

  return `${selected.length} ${t('selected')}`
})

const debouncedPriceChange = debounce(async () => {
  await props.updateFilters({
    priceRange: {
      min: minPrice.value !== '' ? Number(minPrice.value) : null,
      max: maxPrice.value !== '' ? Number(maxPrice.value) : null,
    },
    page: 1,
  })
}, 300)

const handlePriceRangeChange = () => {
  debouncedPriceChange()
}

watch(
  () => safeFilters.value.priceRange,
  value => {
    minPrice.value = value?.min ?? ''
    maxPrice.value = value?.max ?? ''
  },
  {
    deep: true,
    immediate: true,
  },
)

const handleResetFilters = async () => {
  debouncedSearch.cancel()
  debouncedPriceChange.cancel()

  searchValue.value = ''
  minPrice.value = ''
  maxPrice.value = ''

  if (typeof props.resetFilters === 'function') {
    await props.resetFilters()
  }
}

onBeforeUnmount(() => {
  debouncedSearch.cancel()
  debouncedPriceChange.cancel()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.aside {
  @include adaptiveValue('padding', 30, 10);
  @include adaptiveValue('border-radius', 20, 10);
  background-color: var(--bg-primary-color);
  border: 1px solid var(--border-primary-color);
  &__title {
    text-transform: capitalize;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__control,
  &__search {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__search {
    &-icon {
      min-width: 18px;
      height: 18px;
      color: var(--hint-primary-color);
    }
  }

  &__dropdown {
  }

  &__checkbox {
    padding: 5px 0px;
  }

  &__subtitle {
    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__price {
  }

  &__box {
    max-height: 130px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  &__reset {
  }
}
</style>

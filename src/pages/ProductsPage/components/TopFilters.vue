<template>
  <div class="filters">
    <div class="filters__top">
      <div class="filters__title _h4">
        {{ $t('browse') }}
        <span>{{ $t('all skins') }}</span>
      </div>
      <div class="filters__subtitle _h6">
        <span>//</span>
        {{ $t('catalog') }}
      </div>
    </div>
    <div class="filters__bottom">
      <div class="filters__text">
        {{
          $t(
            'Search by name or filter by quality, item type, and price to find exactly what you`re looking for.',
          )
        }}
      </div>
      <BaseInput
        v-model="searchValue"
        class="filters__search"
        :placeholder="$t('Search ...')"
      >
        <template #suffix>
          <SvgIcon class="filters__search-icon" :icon="SearchIcon" />
        </template>
      </BaseInput>
      <BaseButton
        type="button"
        :variant="!filtersOpen ? 'primary ' : 'delete'"
        class="filters__toggle"
        :class="{ active: filtersOpen }"
        @click="toggleFilters"
      >
        <SvgIcon
          v-if="false"
          class="filters__toggle-icon"
          :class="{ active: filtersOpen }"
          :icon="ChevronDownIcon"
        />

        <span>
          {{ filtersOpen ? $t('Close') : $t('Filters') }}
        </span>
      </BaseButton>
    </div>
    <div class="filters__games" v-if="false">
      <BaseButton
        v-for="game in games"
        :key="game.gameCode"
        type="button"
        :variant="activeGame === game.gameCode ? 'primary' : 'white-bordered'"
        class="filters__game"
        :class="{
          active: activeGame === game.gameCode,
        }"
        @click="changeGame(game.gameCode)"
      >
        <SvgIcon :icon="game.icon" class="filters__game-icon" />
      </BaseButton>
    </div>

    <Transition name="filters-slide">
      <div v-if="filtersOpen" class="filters__bottom">
        <div class="filters__content">
          <div class="filters__price">
            <div class="filters__label">
              {{ $t('Price Range') }} (
              {{ currencyStore.currentCurrencySymbol }} )
            </div>

            <PriceRange
              v-model:min="minPrice"
              v-model:max="maxPrice"
              class="filters__price-range"
              :currency-symbol="currencyStore.currentCurrencySymbol"
              placeholder-min="0"
              placeholder-max="10000"
              @change="handlePriceRangeChange"
            />
          </div>

          <div v-if="typeOptions.length" class="filters__field">
            <div class="filters__field-label">{{ $t('Types') }}</div>
            <div class="filters__checkboxes">
              <BaseCheckbox
                v-for="option in typeOptions"
                :key="option.value"
                class="filters__checkbox"
                :model-value="isTypeChecked(option)"
                @update:model-value="toggleType(option)"
              >
                {{ decodeHtml(option.label) }}
              </BaseCheckbox>
            </div>
          </div>

          <div v-if="showHeroesFilter" class="filters__field">
            <div class="filters__field-label">{{ $t('Heroes') }}</div>
            <div class="filters__checkboxes">
              <BaseCheckbox
                v-for="option in safeAvailableFilters.heroes"
                :key="option.value"
                class="filters__checkbox"
                :model-value="safeFilters.hero.includes(option.value)"
                @update:model-value="toggleMulti('hero', option.value)"
              >
                {{ decodeHtml(option.label) }}
              </BaseCheckbox>
            </div>
          </div>

          <div v-if="showCs2ExteriorFilter" class="filters__field">
            <div class="filters__field-label">{{ $t('Exteriors') }}</div>
            <div class="filters__checkboxes">
              <BaseCheckbox
                v-for="option in cs2ExteriorOptions"
                :key="option.value"
                class="filters__checkbox"
                :model-value="selectedCs2ExteriorValues.includes(option.value)"
                @update:model-value="toggleCs2Exterior(option.value)"
              >
                {{ decodeHtml(option.label) }}
              </BaseCheckbox>
            </div>
          </div>

          <div v-if="showDotaQualityFilter" class="filters__field">
            <div class="filters__field-label">{{ $t('Qualities') }}</div>
            <div class="filters__checkboxes">
              <BaseCheckbox
                v-for="option in safeAvailableFilters.qualities"
                :key="option.value"
                class="filters__checkbox"
                :model-value="safeFilters.quality.includes(option.value)"
                @update:model-value="toggleMulti('quality', option.value)"
              >
                {{ decodeHtml(option.label) }}
              </BaseCheckbox>
            </div>
          </div>
          <div class="filters__info">
            <BaseDdropdown
              absolute
              class="filters__dropdown"
              :label="$t(sortLabel)"
            >
              <BaseCheckbox
                v-for="option in sortOptions"
                :key="option.value"
                class="filters__checkbox"
                :model-value="filters.sort === option.value"
                @update:model-value="setSort(option.value)"
              >
                {{ $t(option.label) }}
              </BaseCheckbox>
            </BaseDdropdown>

            <button
              type="button"
              variant="transparent"
              class="filters__reset _link-grey"
              @click="clearFilters"
            >
              {{ $t('Clear All Filters') }}
            </button>
          </div>
        </div>

        <div class="filters__footer" v-if="false">
          <div v-if="activeFilterTags.length" class="filters__selected">
            <button
              v-for="tag in activeFilterTags"
              :key="tag.key"
              type="button"
              class="filters__tag"
              @click="removeFilterTag(tag)"
            >
              <SvgIcon :icon="RemoveIcon" class="filters__tag-remove" />
              <span>{{ tag.label }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
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
import {
  ChevronDownIcon,
  CS,
  DOTA,
  RemoveIcon,
  SearchIcon,
} from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useCurrencyStore } from '@/stores/currency'

const props = defineProps({
  filtersOpen: {
    type: Boolean,
    default: false,
  },

  filters: {
    type: Object,
    required: true,
  },

  availableFilters: {
    type: Object,
    default: () => ({}),
  },

  currentGame: {
    type: String,
    default: 'cs2',
  },

  sortOptions: {
    type: Array,
    required: true,
  },

  updateFilters: {
    type: Function,
    required: true,
  },

  resetFilters: {
    type: Function,
    required: true,
  },

  setCategory: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['update:filtersOpen'])

const { t } = useI18n()
const currencyStore = useCurrencyStore()

const games = [
  {
    gameCode: 'cs2',
    icon: CS,
  },
  {
    gameCode: 'dota2',
    icon: DOTA,
  },
]

const searchValue = ref(props.filters.search || '')
const minPrice = ref('')
const maxPrice = ref('')

const activeGame = computed(() => {
  return String(props.currentGame || 'cs2')
    .trim()
    .toLowerCase()
})

const isCs2 = computed(() => activeGame.value === 'cs2')
const isDota2 = computed(() => activeGame.value === 'dota2')

const safeFilters = computed(() => ({
  type: Array.isArray(props.filters?.type) ? props.filters.type : [],

  quality: Array.isArray(props.filters?.quality) ? props.filters.quality : [],

  subcategories: Array.isArray(props.filters?.subcategories)
    ? props.filters.subcategories
    : [],

  hero: Array.isArray(props.filters?.hero) ? props.filters.hero : [],

  exterior_name: Array.isArray(props.filters?.exterior_name)
    ? props.filters.exterior_name
    : [],

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

const sortLabel = computed(() => {
  return (
    props.sortOptions.find(option => option.value === props.filters.sort)
      ?.label || 'From high to low'
  )
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
    }))
  }

  return safeAvailableFilters.value.types
})

const decodeHtml = value => {
  if (typeof document === 'undefined') {
    return value || ''
  }

  const textarea = document.createElement('textarea')
  textarea.innerHTML = value || ''

  return textarea.value
}

const typeDropdownLabel = computed(() => {
  const selected = safeFilters.value.type

  if (!selected.length) return t('All types')

  if (selected.length === 1) {
    return decodeHtml(selected[0])
  }

  return `${selected.length} ${t('selected')}`
})

const heroDropdownLabel = computed(() => {
  const selected = safeFilters.value.hero

  if (!selected.length) return t('All heroes')

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

  if (!selected.length) return t('All exteriors')

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

  if (!selected.length) return t('All rarities')

  if (selected.length === 1) {
    const option = safeAvailableFilters.value.qualities.find(
      item => item.value === selected[0],
    )

    return decodeHtml(option?.label || selected[0])
  }

  return `${selected.length} ${t('selected')}`
})

const capitalize = value => {
  const text = decodeHtml(value || '')

  return text.charAt(0).toUpperCase() + text.slice(1)
}

const activeFilterTags = computed(() => {
  const tags = []

  if (safeFilters.value.type.length || safeFilters.value.subcategories.length) {
    tags.push({
      key: 'types',
      field: 'types',
      label: t('Types'),
    })
  }

  if (safeFilters.value.hero.length) {
    tags.push({
      key: 'heroes',
      field: 'hero',
      label: t('Heroes'),
    })
  }

  if (isCs2.value && selectedCs2ExteriorValues.value.length) {
    tags.push({
      key: 'exterior',
      field: 'cs2Exterior',
      label: t('Exterior'),
    })
  }

  if (isDota2.value && safeFilters.value.quality.length) {
    tags.push({
      key: 'rarity',
      field: 'quality',
      label: t('Rarity'),
    })
  }

  if (
    safeFilters.value.priceRange.min != null ||
    safeFilters.value.priceRange.max != null
  ) {
    tags.push({
      key: 'price-range',
      field: 'priceRange',
      label: t('Price'),
    })
  }

  if (searchValue.value.trim()) {
    tags.push({
      key: 'search',
      field: 'search',
      label: t('Search'),
    })
  }

  const defaultSort = props.sortOptions[0]?.value || 'desc'

  if (props.filters.sort !== defaultSort) {
    tags.push({
      key: 'sort',
      field: 'sort',
      label: t('Sort'),
    })
  }

  return tags
})
const toggleFilters = () => {
  emit('update:filtersOpen', !props.filtersOpen)
}

const applySearch = debounce(async () => {
  await props.updateFilters({
    search: searchValue.value.trim(),
    page: 1,
  })
}, 300)

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

const changeGame = async gameCode => {
  if (!gameCode || gameCode === activeGame.value) {
    return
  }

  applySearch.cancel()
  debouncedPriceChange.cancel()

  searchValue.value = ''
  minPrice.value = ''
  maxPrice.value = ''

  await props.setCategory(gameCode)
}

const setSort = async value => {
  if (props.filters.sort === value) return

  await props.updateFilters({
    sort: value,
    page: 1,
  })
}

const toggleMulti = async (key, value) => {
  const current = [...(safeFilters.value[key] || [])]

  const index = current.indexOf(value)

  if (index >= 0) {
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

const removeFilterTag = async tag => {
  if (tag.field === 'types') {
    await props.updateFilters({
      type: [],
      subcategories: [],
      page: 1,
    })

    return
  }

  if (tag.field === 'hero') {
    await props.updateFilters({
      hero: [],
      page: 1,
    })

    return
  }

  if (tag.field === 'cs2Exterior') {
    await props.updateFilters({
      quality: [],
      exterior_name: [],
      page: 1,
    })

    return
  }

  if (tag.field === 'quality') {
    await props.updateFilters({
      quality: [],
      page: 1,
    })

    return
  }

  if (tag.field === 'priceRange') {
    debouncedPriceChange.cancel()

    minPrice.value = ''
    maxPrice.value = ''

    await props.updateFilters({
      priceRange: {
        min: null,
        max: null,
      },
      page: 1,
    })

    return
  }

  if (tag.field === 'search') {
    applySearch.cancel()
    searchValue.value = ''

    await props.updateFilters({
      search: '',
      page: 1,
    })

    return
  }

  if (tag.field === 'sort') {
    const defaultSort = props.sortOptions[0]?.value || 'desc'

    await props.updateFilters({
      sort: defaultSort,
      page: 1,
    })
  }
}
const clearFilters = async () => {
  applySearch.cancel()
  debouncedPriceChange.cancel()

  searchValue.value = ''
  minPrice.value = ''
  maxPrice.value = ''

  await props.resetFilters()
}

watch(searchValue, () => {
  applySearch()
})

watch(
  () => props.filters.search,
  value => {
    const nextValue = value || ''

    if (nextValue !== searchValue.value) {
      searchValue.value = nextValue
    }
  },
)

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

onBeforeUnmount(() => {
  applySearch.cancel()
  debouncedPriceChange.cancel()
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.filters {
  &__top {
    display: flex;
    flex-wrap: wrap;
    column-gap: 20px;
    row-gap: 15px;
    justify-content: space-between;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 18, 15);
    }
  }

  &__title {
  }

  &__subtitle {
    span {
      margin-right: 10px;
    }
  }

  &__bottom {
    display: flex;
    @include adaptiveValue('gap', 20, 10);
    @media (max-width: $md2) {
      column-gap: 20px;
      row-gap: 15px;
      flex-wrap: wrap;
    }
  }

  &__text {
    flex: 0 1 36%;
    @media (max-width: $md2) {
      flex: 1 1 100%;
    }
  }

  &__search {
    flex: 0 1 56%;
    @media (max-width: $md2) {
      flex: 0 1 calc(65% - 10px);
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
    &-icon {
      min-width: 20px;
      height: 20px;
      color: var(--hint-primary-color);
    }
  }

  &__toggle {
    flex: 0 1 18%;
    @media (max-width: $md2) {
      flex: 0 1 calc(35% - 10px);
    }
    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__content {
    @include adaptiveValue('margin-top', 20, 10);
    @include adaptiveValue('padding', 30, 10);
    background-color: var(--bg-secondary-color);
    @include adaptiveValue('border-radius', 10, 4);
    display: flex;
    width: 100%;
    column-gap: 20px;
    row-gap: 15px;
    @media (max-width: $md2) {
      flex-wrap: wrap;
    }
    @media (max-width: $md3) {
      margin-left: -10px;
      margin-right: -10px;
      width: auto;
    }
  }

  &__price {
    flex: 0 1 25%;
    @media (max-width: $md2) {
      flex: 0 1 calc(50% - 10px);
      order: 1;
    }
    @media (max-width: $md5) {
      flex: 1 1 100%;
    }
    &-range {
    }
  }

  &__label {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 10);
    }
  }

  &__field {
    flex: 0 1 25%;
    @media (max-width: $md2) {
      flex: 0 1 calc(50% - 10px);
      order: 3;
    }
    @media (max-width: $md5) {
      flex: 1 1 100%;
    }
    &-label {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 16, 10);
      }
    }
    &_sort {
    }
  }

  &__checkboxes {
    display: flex;
    flex-wrap: wrap;
    column-gap: 20px;
  }

  &__checkbox {
    flex: 0 1 calc(50% - 20px);
    padding: 7px 0px;
    :deep(.base-checkbox__label) {
      text-transform: capitalize;
    }
  }

  &__info {
    flex: 0 1 25%;
    @media (max-width: $md2) {
      flex: 0 1 calc(50% - 10px);
      order: 2;
    }
    @media (max-width: $md5) {
      flex: 1 1 100%;
      order: 4;
    }
  }

  &__dropdown {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 63, 15);
    }
  }

  &__reset {
    width: fit-content;
    margin-left: auto;
  }
}

.filters-slide-enter-active,
.filters-slide-leave-active {
  transition:
    opacity 0.3s ease,
    transform 0.3s ease;
}

.filters-slide-enter-from,
.filters-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.filters-slide-enter-to,
.filters-slide-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>

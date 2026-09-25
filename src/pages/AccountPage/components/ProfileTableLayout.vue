<template>
  <div class="profile-layout">
    <div v-if="isLoading" class="profile-layout__state">
      <LoadingSpinner />
    </div>

    <div
      v-else-if="!rows.length"
      class="profile-layout__state profile-layout__state_empty"
    >
      {{ emptyText }}
    </div>

    <div v-else class="profile-layout__content">
      <div class="profile-layout__table">
        <div class="profile-layout__head" :style="gridStyle">
          <div class="profile-layout__head-cell profile-layout__head-cell_id">
            {{ $t('ID') }}
          </div>

          <div v-if="showDataColumn" class="profile-layout__head-cell">
            {{ $t('Date / time') }}
          </div>

          <div v-if="showType" class="profile-layout__head-cell">
            {{ $t('Type') }}
          </div>

          <div v-if="showItemGame" class="profile-layout__head-cell">
            {{ $t('Game') }}
          </div>

          <div v-if="showSkinName" class="profile-layout__head-cell">
            {{ $t('Item') }}
          </div>

          <div v-if="showCoinAmount" class="profile-layout__head-cell">
            {{ totalLabelText }}
          </div>

          <div v-if="showPrice" class="profile-layout__head-cell">
            {{ totalLabelText }}
          </div>

          <div v-if="showQuantity" class="profile-layout__head-cell">
            {{ $t('Quantity') }}
          </div>

          <div v-if="showAction" class="profile-layout__head-cell">
            {{ actionLabelText }}
          </div>

          <div class="profile-layout__head-cell">
            {{ $t('Status') }}
          </div>
        </div>

        <div class="profile-layout__body">
          <template v-for="(row, index) in rows" :key="row[rowKey] ?? index">
            <Transition name="profile-expand">
              <div
                v-if="expandedRowKey === (row[rowKey] ?? index)"
                class="profile-layout__expanded"
              >
                <slot name="expanded" :row="row" />
              </div>
            </Transition>

            <div
              class="profile-layout__row"
              :class="{
                'profile-layout__row_active':
                  expandedRowKey === (row[rowKey] ?? index),
              }"
              :style="gridStyle"
            >
              <div class="profile-layout__cell profile-layout__cell_id">
                <span class="profile-layout__mobile-label">
                  {{ $t('ID') }}
                </span>

                <span class="profile-layout__value profile-layout__value_id">
                  {{ row.id }}
                </span>
              </div>

              <div v-if="showDataColumn" class="profile-layout__cell">
                <span class="profile-layout__mobile-label">
                  {{ $t('Date / time') }}
                </span>

                <span class="profile-layout__value profile-layout__date">
                  <span>
                    {{ formatDate(row.createdAt, 'DD.MM.YYYY') }}
                  </span>

                  <span class="profile-layout__date-divider"> / </span>

                  <span>
                    {{ formatDate(row.createdAt, 'HH:mm') }}
                  </span>
                </span>
              </div>

              <div v-if="showType" class="profile-layout__cell">
                <span class="profile-layout__mobile-label">
                  {{ $t('Type') }}
                </span>

                <span class="profile-layout__value">
                  {{ row.type || '—' }}
                </span>
              </div>

              <div v-if="showItemGame" class="profile-layout__cell">
                <span class="profile-layout__mobile-label">
                  {{ $t('Game') }}
                </span>

                <span class="profile-layout__value">
                  {{ row.gameLabel || '—' }}
                </span>
              </div>

              <div
                v-if="showSkinName"
                class="profile-layout__cell profile-layout__cell_item"
              >
                <span
                  class="profile-layout__mobile-label"
                  :class="{
                    'profile-layout__mobile-label_hidden': hideSkinNameLabel,
                  }"
                >
                  {{ $t('Item') }}
                </span>

                <div class="profile-layout__items">
                  <div
                    v-for="(item, itemIndex) in getSkinItems(row)"
                    :key="`${row._key || row.id}-skin-${itemIndex}`"
                    class="profile-layout__item"
                  >
                    <div
                      v-if="showOrderImage && item.image"
                      class="profile-layout__image"
                    >
                      <img :src="item.image" :alt="formatSkinName(item)" />
                    </div>

                    <div class="profile-layout__item-name">
                      {{ formatSkinName(item) }}
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="showCoinAmount"
                class="profile-layout__cell profile-layout__cell_total"
              >
                <span class="profile-layout__mobile-label">
                  {{ totalLabelText }}
                </span>

                <span class="profile-layout__value profile-layout__value_total">
                  <PriceFormatter
                    class="profile-layout__price"
                    size="size-16"
                    reverse
                    :price="formatPriceInCoins(row.currency, row.amount)"
                    skip-conversion
                    :is-currency="Boolean(row.currency)"
                    :currency-code="row.currency"
                  />
                </span>
              </div>

              <div
                v-if="showPrice"
                class="profile-layout__cell profile-layout__cell_total"
              >
                <span class="profile-layout__mobile-label">
                  {{ totalLabelText }}
                </span>

                <span class="profile-layout__value profile-layout__value_total">
                  <PriceFormatter
                    class="profile-layout__price"
                    size="size-16"
                    reverse
                    :is-currency="totalAsCurrency"
                    :price="getRowTotal(row)"
                    :currency-symbol="row.currencySymbol"
                    :currency-code="row.currency"
                  />
                </span>
              </div>

              <div v-if="showQuantity" class="profile-layout__cell">
                <span class="profile-layout__mobile-label">
                  {{ $t('Quantity') }}
                </span>

                <span class="profile-layout__value profile-layout__value_bold">
                  {{ row.quantity || '—' }}
                </span>
              </div>

              <div
                v-if="showAction"
                class="profile-layout__cell profile-layout__cell_action"
              >
                <span class="profile-layout__mobile-label">
                  {{ actionLabelText }}
                </span>

                <div class="profile-layout__action">
                  <slot name="action" :row="row" />
                </div>
              </div>

              <div class="profile-layout__cell profile-layout__cell_status">
                <span class="profile-layout__mobile-label">
                  {{ $t('Status') }}
                </span>

                <span
                  class="profile-layout__status"
                  :class="row.statusClass || statusClass(row.status)"
                >
                  {{ row.status }}
                </span>
              </div>
            </div>
          </template>
        </div>
      </div>

      <div v-if="totalPages > 1" class="profile-layout__pagination">
        <PaginationComponent
          :total-pages="totalPages"
          :current-page="currentPage"
          @update:current-page="$emit('update:current-page', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'

import { formatDate } from '@/utils/formatters'

const props = defineProps({
  rows: {
    type: Array,
    default: () => [],
  },

  isLoading: {
    type: Boolean,
    default: false,
  },

  emptyText: {
    type: String,
    default: 'No data found',
  },

  loadingText: {
    type: String,
    default: 'Loading...',
  },

  totalPages: {
    type: Number,
    default: 1,
  },

  currentPage: {
    type: Number,
    default: 1,
  },

  rowKey: {
    type: String,
    default: '_key',
  },

  totalLabel: {
    type: String,
    default: 'Total',
  },

  actionLabel: {
    type: String,
    default: 'Action',
  },

  showAction: {
    type: Boolean,
    default: false,
  },

  showSkinName: {
    type: Boolean,
    default: false,
  },

  showType: {
    type: Boolean,
    default: false,
  },

  showCoinAmount: {
    type: Boolean,
    default: false,
  },

  showItemGame: {
    type: Boolean,
    default: false,
  },

  showQuantity: {
    type: Boolean,
    default: false,
  },

  hideSkinNameLabel: {
    type: Boolean,
    default: false,
  },

  showDataColumn: {
    type: Boolean,
    default: true,
  },

  showPrice: {
    type: Boolean,
    default: true,
  },

  isAmountMultiplied: {
    type: Boolean,
    default: false,
  },

  showOrderImage: {
    type: Boolean,
    default: true,
  },

  totalAsCurrency: {
    type: Boolean,
    default: true,
  },

  expandedRowKey: {
    type: [String, Number, null],
    default: null,
  },
})

defineEmits(['update:current-page'])

const totalLabelText = computed(() => props.totalLabel || 'Total')

const actionLabelText = computed(() => props.actionLabel || 'Action')

const gridColumns = computed(() => {
  const columns = []

  columns.push('minmax(64px, 0.72fr)')

  if (props.showDataColumn) {
    columns.push('minmax(112px, 1.15fr)')
  }

  if (props.showType) {
    columns.push('minmax(90px, 1fr)')
  }

  if (props.showItemGame) {
    columns.push('minmax(80px, 0.8fr)')
  }

  if (props.showSkinName) {
    columns.push('minmax(120px, 1.9fr)')
  }

  if (props.showCoinAmount) {
    columns.push('minmax(90px, 0.95fr)')
  }

  if (props.showPrice) {
    columns.push('minmax(90px, 0.95fr)')
  }

  if (props.showQuantity) {
    columns.push('minmax(70px, 0.65fr)')
  }

  if (props.showAction) {
    columns.push('minmax(82px, 0.8fr)')
  }

  columns.push('minmax(90px, 0.85fr)')

  return columns.join(' ')
})

const gridStyle = computed(() => {
  return {
    gridTemplateColumns: gridColumns.value,
  }
})

const getSkinItems = row => {
  if (Array.isArray(row?.skinItems) && row.skinItems.length) {
    return row.skinItems
  }

  return [
    {
      title: row?.title || row?.skinName || '—',

      image: row?.image || '',
    },
  ]
}

const formatSkinName = item => {
  return String(item?.title || '—')
    .replace(/StatTrak™?\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const formatPriceInCoins = (code, value) => {
  const amount = Number(value) || 0

  return amount.toFixed(2)
}

const getRowTotal = row => {
  return Number(row?.total ?? row?.fiatAmount ?? row?.amount ?? 0)
}

const statusClass = status => {
  const value = String(status || '')
    .toLowerCase()
    .trim()

  if (
    value.includes('accepted') ||
    value.includes('completed') ||
    value.includes('successful') ||
    value.includes('success') ||
    value.includes('approved') ||
    value.includes('ready for payout')
  ) {
    return 'is-success'
  }

  if (
    value.includes('pending') ||
    value.includes('processing') ||
    value.includes('awaiting')
  ) {
    return 'is-pending'
  }

  if (
    value.includes('canceled') ||
    value.includes('cancelled') ||
    value.includes('declined') ||
    value.includes('denied') ||
    value.includes('error') ||
    value.includes('deleted')
  ) {
    return 'is-canceled'
  }

  return 'is-neutral'
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.profile-layout {
  width: 100%;
  min-width: 0;

  &__content {
    width: 100%;
    min-width: 0;
  }

  &__state {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 100%;
    min-height: 240px;

    border-radius: 30px;

    background: var(--double-spanish-white);

    &_empty {
      padding: 30px;

      @include ibm-14-700;

      color: var(--makara);

      text-align: center;
    }
  }

  &__table {
    overflow: hidden;

    width: 100%;
    min-width: 0;

    border-radius: 30px;

    background: var(--double-spanish-white);
  }

  &__head {
    display: grid;
    align-items: center;

    width: 100%;
    min-width: 0;

    padding: 0 24px;

    border-bottom: 1px solid var(--cod-gray-07);
  }

  &__head-cell {
    overflow: hidden;

    min-width: 0;

    padding: 20px 10px;

    @include ibm-11-700;

    color: var(--makara);

    letter-spacing: 0.08em;
    text-overflow: ellipsis;
    text-transform: uppercase;
    white-space: nowrap;

    &_id {
      padding-left: 0;
    }
  }

  &__body {
    width: 100%;
    min-width: 0;
  }

  &__row {
    display: grid;
    align-items: center;

    width: 100%;
    min-width: 0;

    padding: 0 24px;

    transition: background-color 0.2s ease;

    &:not(:last-child) {
      border-bottom: 1px solid var(--cod-gray-07);
    }

    &_active {
      background: rgb(198, 113, 57, 0.06);
    }
  }

  &__cell {
    display: flex;
    align-items: center;

    min-width: 0;

    padding: 19px 10px;

    &_id {
      padding-left: 0;
    }

    &_item {
      overflow: hidden;
    }

    &_total {
      overflow: hidden;
    }

    &_status {
      justify-content: flex-start;
    }

    &_action {
      justify-content: flex-start;
    }
  }

  &__mobile-label {
    display: none;
  }

  &__value {
    overflow: hidden;

    min-width: 0;

    @include ibm-14-400;

    color: var(--cod-gray);

    text-overflow: ellipsis;
    white-space: nowrap;

    &_id,
    &_total,
    &_bold {
      @include ibm-14-700;

      color: var(--cod-gray);
    }
  }

  &__date {
    display: flex;
    align-items: center;

    gap: 4px;

    color: var(--soya-bean);
  }

  &__date-divider {
    color: var(--zorba);
  }

  &__items {
    overflow: hidden;

    width: 100%;
    min-width: 0;
  }

  &__item {
    display: flex;
    align-items: center;

    gap: 12px;

    width: 100%;
    min-width: 0;

    &:not(:last-child) {
      margin-bottom: 8px;
    }
  }

  &__image {
    position: relative;

    flex: 0 0 52px;

    width: 52px;
    height: 40px;

    overflow: hidden;

    border-radius: 12px;

    background: linear-gradient(
      135deg,
      var(--janna),
      var(--double-spanish-white)
    );

    img {
      width: 100%;
      height: 100%;

      padding: 4px;

      object-fit: contain;
    }
  }

  &__item-name {
    overflow: hidden;

    min-width: 0;

    @include ibm-14-400;

    color: var(--cod-gray);

    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__price {
    min-width: 0;

    :deep(.price) {
      min-width: 0;
    }

    :deep(.price__value),
    :deep(.price__currency) {
      @include ibm-14-700;

      color: var(--cod-gray) !important;
    }
  }

  &__status {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    min-height: 30px;

    max-width: 100%;

    padding: 7px 14px;

    border-radius: 999px;

    @include ibm-11-700;

    color: var(--cod-gray);

    white-space: nowrap;

    &.is-success {
      background: var(--feta);

      color: var(--kelp);
    }

    &.is-pending {
      background: var(--merino);

      color: var(--soya-bean);
    }

    &.is-canceled {
      background: #f9d9c9;

      color: var(--hairy-heath);
    }

    &.is-neutral {
      background: var(--merino);

      color: var(--soya-bean);
    }
  }

  &__action {
    min-width: 0;

    :deep(button),
    :deep(a) {
      min-height: 36px;

      padding: 8px 18px;

      border: 1px solid var(--cod-gray-16);

      border-radius: 999px;

      background: transparent;

      color: var(--cod-gray);

      transition:
        border-color 0.2s ease,
        background-color 0.2s ease,
        color 0.2s ease;

      @media (any-hover: hover) {
        &:hover {
          border-color: var(--copper);

          color: var(--copper);
        }
      }
    }
  }

  &__expanded {
    width: 100%;

    padding: 20px 24px;

    border-bottom: 1px solid var(--cod-gray-07);

    background: rgb(255, 255, 255, 0.18);
  }

  &__pagination {
    display: flex;
    justify-content: center;

    margin-top: 28px;

    :deep(.pagination) {
      justify-content: center;
    }
  }
}

.profile-expand-enter-active,
.profile-expand-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.profile-expand-enter-from,
.profile-expand-leave-to {
  opacity: 0;

  transform: translateY(-6px);
}

@media (max-width: $md2) {
  .profile-layout {
    &__head,
    &__row {
      padding-right: 18px;
      padding-left: 18px;
    }

    &__head-cell {
      padding-right: 6px;
      padding-left: 6px;
    }

    &__cell {
      padding-right: 6px;
      padding-left: 6px;
    }

    &__head-cell,
    &__value,
    &__item-name {
      font-size: 12px;
    }

    &__status {
      padding-right: 10px;
      padding-left: 10px;
    }
  }
}

@media (max-width: $md3) {
  .profile-layout {
    &__table {
      overflow: visible;

      border-radius: 0;

      background: transparent;
    }

    &__head {
      display: none;
    }

    &__body {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      gap: 14px;
    }

    &__row {
      display: flex;
      flex-direction: column;
      align-items: stretch;

      min-width: 0;

      padding: 20px;

      border: 0 !important;

      border-radius: 24px;

      background: var(--double-spanish-white);
    }

    &__cell {
      display: grid;
      grid-template-columns:
        minmax(0, 0.85fr)
        minmax(0, 1.15fr);

      align-items: center;

      gap: 12px;

      width: 100%;

      padding: 0;

      &:not(:last-child) {
        margin-bottom: 15px;
      }

      &_item,
      &_total {
        overflow: visible;
      }
    }

    &__mobile-label {
      display: block;

      min-width: 0;

      @include ibm-11-700;

      color: var(--makara);

      letter-spacing: 0.06em;
      text-transform: uppercase;

      &_hidden {
        display: block;
      }
    }

    &__value {
      min-width: 0;

      text-align: right;

      white-space: normal;
      overflow-wrap: anywhere;

      &_id,
      &_total,
      &_bold {
        text-align: right;
      }
    }

    &__date {
      justify-content: flex-end;

      flex-wrap: wrap;
    }

    &__items {
      min-width: 0;
    }

    &__item {
      justify-content: flex-end;
    }

    &__item-name {
      white-space: normal;

      text-align: right;

      overflow-wrap: anywhere;
    }

    &__image {
      flex-basis: 48px;

      width: 48px;
      height: 38px;
    }

    &__price {
      margin-left: auto;
    }

    &__status {
      justify-self: end;
    }

    &__action {
      display: flex;
      justify-content: flex-end;
    }

    &__expanded {
      grid-column: 1 / -1;

      padding: 20px;

      border: 0;

      border-radius: 24px;

      background: var(--double-spanish-white);
    }

    &__pagination {
      margin-top: 24px;
    }
  }
}

@media (max-width: $md6) {
  .profile-layout {
    &__body {
      grid-template-columns: 1fr;
    }

    &__row {
      padding: 18px;
    }
  }
}

@media (max-width: $md7) {
  .profile-layout {
    &__cell {
      grid-template-columns:
        minmax(0, 0.9fr)
        minmax(0, 1.1fr);

      gap: 10px;
    }

    &__row {
      border-radius: 20px;
    }
  }
}
</style>

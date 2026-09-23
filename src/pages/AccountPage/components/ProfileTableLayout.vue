<template>
  <div class="profile-layout">
    <LoadingSpinner v-if="isLoading" class="profile-layout__loading" />
    <div
      v-else-if="!rows.length && !isLoading"
      class="profile-layout__empty _h3"
    >
      {{ emptyText }}
    </div>

    <div v-else class="profile-layout__content">
      <div class="profile-layout__table-wrap">
        <div class="profile-layout__table-head">
          <div class="profile-layout__th profile-layout__th_id">
            {{ $t('ID') }}
          </div>

          <div
            v-if="showDataColumn"
            class="profile-layout__th profile-layout__th_date"
          >
            {{ $t('Date/time') }}
          </div>

          <div
            v-if="showType"
            class="profile-layout__th profile-layout__th_type"
          >
            {{ $t('Type') }}
          </div>
          <div
            v-if="showItemGame"
            class="profile-layout__th profile-layout__th_game"
          >
            {{ $t('Game') }}
          </div>
          <div
            v-if="showSkinName"
            class="profile-layout__th profile-layout__th_skin"
          >
            {{ $t('Item') }}
          </div>
          <div
            v-if="showCoinAmount"
            class="profile-layout__th profile-layout__th_coinAmount"
          >
            {{ $t('Amount') }}
          </div>
          <div
            v-if="showPrice"
            class="profile-layout__th profile-layout__th_total"
          >
            {{ $t('Total') }}
          </div>

          <div
            v-if="showQuantity"
            class="profile-layout__th profile-layout__th_quantity"
          >
            {{ $t('Quantity') }}
          </div>

          <div class="profile-layout__th profile-layout__th_status">
            {{ $t('Status') }}
          </div>

          <div
            v-if="showAction"
            class="profile-layout__th profile-layout__th_action"
          ></div>
        </div>

        <div class="profile-layout__table-body">
          <template v-for="(row, index) in rows" :key="row[rowKey] ?? index">
            <transition name="fade">
              <div
                v-if="expandedRowKey === (row[rowKey] ?? index)"
                class="profile-layout__expanded"
              >
                <slot name="expanded" :row="row"></slot>
              </div>
            </transition>

            <div
              class="profile-layout__tr"
              :class="{ active: expandedRowKey === (row[rowKey] ?? index) }"
            >
              <div class="profile-layout__td profile-layout__td_id">
                <span>{{ $t('ID') }}</span>
                <span>{{ row.id }}</span>
              </div>

              <div
                v-if="showDataColumn"
                class="profile-layout__td profile-layout__td_date"
              >
                <span>{{ $t('Date/time') }}</span>
                <span class="profile-layout__date">
                  <div>{{ formatDate(row.createdAt, 'DD.MM.YYYY') }}</div>
                  <div class="profile-layout__date-time">
                    {{ formatDate(row.createdAt, 'HH:mm') }}
                  </div>
                </span>
              </div>

              <div
                v-if="showType"
                class="profile-layout__td profile-layout__td_type"
              >
                <span>{{ $t('Type') }}</span>
                <span>{{ row.type }}</span>
              </div>
              <div
                v-if="showItemGame"
                class="profile-layout__td profile-layout__td_game"
              >
                <span>{{ $t('Game') }}</span>
                <span>{{ row.gameLabel }}</span>
              </div>
              <div
                v-if="showSkinName"
                class="profile-layout__td profile-layout__td_skin"
              >
                <span :class="{ hide: hideSkinNameLabel }">
                  {{ $t('Item') }}
                </span>

                <div
                  class="profile-layout__skins"
                  :class="{ 'full-size': !hideSkinNameLabel }"
                >
                  <div
                    v-for="(item, itemIndex) in row.skinItems?.length
                      ? row.skinItems
                      : [{ title: '—', image: '' }]"
                    :key="`${row._key}-skin-${itemIndex}`"
                    class="profile-layout__skin"
                  >
                    <div
                      v-if="item.image && showOrderImage"
                      class="profile-layout__skin-wrapper"
                    >
                      <div class="profile-layout__skin-image _ibg-contain">
                        <img :src="item.image" />
                      </div>
                    </div>

                    <div class="profile-layout__skin-info">
                      <div class="profile-layout__skin-quality">
                        {{ formatSkinName(item) }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                v-if="showCoinAmount"
                class="profile-layout__td profile-layout__td_coinAmount"
              >
                <span>{{ $t('Total') }}</span>
                <span>
                  <PriceFormatter
                    size="size-16"
                    reverse
                    class="profile-layout__price-formatter"
                    :price="formatPriceInCoins(row.currency, row.amount)"
                    skipConversion
                  />
                </span>
              </div>
              <div
                v-if="showPrice"
                class="profile-layout__td profile-layout__td_total"
              >
                <span>{{ $t('Amount') }}</span>
                <span>
                  <PriceFormatter
                    class="profile-layout__price-formatter"
                    size="size-16"
                    reverse
                    :is-currency="totalAsCurrency"
                    :price="row.total"
                    :currency-symbol="row.currencySymbol"
                  />
                </span>
              </div>

              <div
                v-if="showQuantity && row.quantity"
                class="profile-layout__td profile-layout__td_quantity"
              >
                <span>{{ $t('Quantity') }}</span>
                <span>{{ row.quantity }}</span>
              </div>

              <div class="profile-layout__td profile-layout__td_status">
                <span>{{ $t('Status') }}</span>
                <span
                  class="profile-layout__status"
                  :class="row.statusClass || statusClass(row.status)"
                >
                  <SvgIcon
                    v-if="false"
                    :icon="row.statusIcon || statusIcon(row.status)"
                    class="profile-layout__status-icon"
                  />

                  <span>{{ row.status }}</span>
                </span>
              </div>

              <div
                v-if="showAction"
                class="profile-layout__td profile-layout__td_action"
              >
                <span>{{ $t('Details') }}</span>
                <span class="profile-layout__action">
                  <slot name="action" :row="row"></slot>
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
import { ErrorIcon, PendingIcon, SuccessIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PaginationComponent from '@/components/PaginationComponent.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import { useCurrencyStore } from '@/stores/currency'
import { formatDate } from '@/utils/formatters'
import { storeToRefs } from 'pinia'

const props = defineProps({
  rows: { type: Array, default: () => [] },
  isLoading: { type: Boolean, default: false },
  emptyText: { type: String, default: 'No data found' },
  loadingText: { type: String, default: 'Loading...' },
  totalPages: { type: Number, default: 1 },
  currentPage: { type: Number, default: 1 },
  rowKey: { type: String, default: '_key' },
  totalLabel: { type: String, default: 'Total' },
  actionLabel: { type: String, default: 'Action' },
  showAction: { type: Boolean, default: false },
  showSkinName: { type: Boolean, default: false },
  showType: { type: Boolean, default: false },
  showCoinAmount: { type: Boolean, default: false },
  showItemGame: { type: Boolean, default: false },
  showQuantity: { type: Boolean, default: false },
  hideSkinNameLabel: { type: Boolean, default: false },
  showDataColumn: { type: Boolean, default: true },
  showPrice: { type: Boolean, default: true },
  isAmountMultiplied: { type: Boolean, default: false },
  showOrderImage: { type: Boolean, default: true },
  totalAsCurrency: { type: Boolean, default: true },
  expandedRowKey: {
    type: [String, Number, null],
    default: null,
  },
})

defineEmits(['update:current-page'])

const currencyStore = useCurrencyStore()
const { currencies } = storeToRefs(currencyStore)

const getCurrencyByCode = code => {
  const normalizedCode = String(code || '').toUpperCase()

  return currencies.value.find(
    currency => String(currency.code).toUpperCase() === normalizedCode,
  )
}

const formatPriceInCoins = (code, fiatNumber) => {
  //const currency = getCurrencyByCode(code)
  //const rate = Number(currency?.value) || 1
  const amount = Number(fiatNumber) || 0
  //const result = props.isAmountMultiplied ? amount * rate : amount / rate

  //return result.toFixed(2)
  return amount.toFixed(2)
}

const formatSkinName = item => {
  return String(item?.title || '')
    .replace(/StatTrak™?\s*/gi, '')
    .replace(/Souvenir\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim()
}

const statusIcon = status => {
  const className = statusClass(status)

  if (className === 'is-success') return SuccessIcon
  if (className === 'is-warn') return PendingIcon
  if (className === 'is-danger') return ErrorIcon

  return PendingIcon
}

const statusClass = status => {
  const s = String(status || '')
    .toLowerCase()
    .trim()

  if (
    s.includes('accepted') ||
    s.includes('completed') ||
    s.includes('success') ||
    s.includes('approved') ||
    s.includes('ready for payout') ||
    s.includes('offer')
  ) {
    return 'is-success'
  }

  if (
    s.includes('pending') ||
    s.includes('processing') ||
    s.includes('awaiting') ||
    s.includes('payout processing')
  ) {
    return 'is-warn'
  }

  if (
    s.includes('canceled') ||
    s.includes('cancelled') ||
    s.includes('declined') ||
    s.includes('denied') ||
    s.includes('error') ||
    s.includes('deleted')
  ) {
    return 'is-danger'
  }

  return 'is-muted'
}
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.profile-layout {
  flex: 1 1 100%;
  display: flex;
  flex-direction: column;
  min-height: 100%;

  &__loading,
  &__empty {
    margin: auto;
  }

  &__empty {
    text-align: center;
    color: var(--pending-color);
    font-weight: 400 !important;
    text-transform: none;
  }

  &__table {
    &-wrap {
      &:not(:last-child) {
        @include adaptiveValue('margin-bottom', 40, 20);
      }
      @media (min-width: $md3) {
        padding: 10px;
        @include adaptiveValue('border-radius', 20, 10);
        background-color: var(--bg-primary-color);
        border: 1px solid var(--border-primary-color);
      }
    }

    &-head {
      @media (min-width: $md3) {
        display: flex;
        justify-content: space-between;
        @include adaptiveValue('gap', 40, 20, 1440, 1100, 1);
        @include adaptiveValue('padding-left', 30, 10, 1440, 1100, 1);
        @include adaptiveValue('padding-right', 30, 10, 1440, 1100, 1);
        @include adaptiveValue('padding-top', 30, 10);
        @include adaptiveValue('padding-bottom', 20, 10);
        background-color: var(--bg-secondary-color);
        @include adaptiveValue('border-radius', 20, 10);
      }

      @media (max-width: $md3) {
        @include hide-item;
      }
    }

    &-body {
      @media (max-width: $md3) {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
      }

      @media (max-width: $md4) {
        margin-left: -10px;
        margin-right: -10px;
      }
    }
  }

  &__th {
    @media (min-width: $md3) {
      color: var(--secondary-color);
      font-size: 16px;
      line-height: 120%;
      font-weight: 400;
      font-family: var(--font-inter);

      &_id {
        flex: 0 0 15%;
      }

      &_date {
        flex: 0 0 10%;
        min-width: 100px;
      }

      &_type,
      &_game {
        flex: 0 0 10%;
      }

      &_skin {
        overflow: hidden;
        flex: 1 1 100%;
        max-width: 300px;
      }

      &_coinAmount,
      &_total {
        flex: 0 0 12%;
      }

      &_quantity {
        flex: 0 0 10%;
      }

      &_status {
        flex: 0 0 10%;
        min-width: 100px;
      }

      &_action {
        min-width: 103px;
      }
    }
  }

  &__expanded {
    @media (min-width: $md3) {
      @include adaptiveValue('margin-top', 23, 10);
      @include adaptiveValue('margin-bottom', 33, 10);
    }

    @media (max-width: $md3) {
      margin: 0;
      flex: 1 1 100%;
    }
  }

  &__tr {
    @include adaptiveValue('padding-left', 30, 10, 1440, 1100, 1);
    @include adaptiveValue('padding-right', 30, 10, 1440, 1100, 1);
    @include adaptiveValue('padding-top', 20, 10);
    @include adaptiveValue('padding-bottom', 20, 10);
    @include adaptiveValue('border-radius', 20, 10);

    @media (min-width: $md3) {
      display: flex;
      justify-content: space-between;
      @include adaptiveValue('gap', 40, 20, 1440, 1100, 1);
      text-align: center;
      &:nth-child(even) {
        background-color: var(--bg-secondary-color);
      }
    }

    @media (max-width: $md3) {
      flex: 0 1 calc(50% - 2px);
      overflow: hidden;
      background-color: var(--bg-secondary-color);
    }

    @media (max-width: $md6) {
      flex: 1 1 100%;
    }
  }

  &__td {
    @media (max-width: $md3) {
      display: flex;
      justify-content: space-between;
      gap: 20px;

      &:not(:last-child) {
        margin-bottom: 15px;
      }
    }

    > span {
      &:first-child {
        @media (min-width: $md3) {
          @include hide-item;
        }

        @media (max-width: $md3) {
          color: var(--secondary-color);
          font-size: 16px;
          line-height: 120%;
          font-weight: 400;
          font-family: var(--font-inter);
        }
      }

      &:last-child {
        text-align: left;
        font-family: var(--font-inter);
        font-size: 16px;
        line-height: 120%;
        color: var(--primary-color);
      }

      @media (max-width: $md3) {
        flex: 0 1 50%;
      }
    }

    &_id {
      @media (min-width: $md3) {
        flex: 0 0 15%;
        text-align: left;
      }
    }

    &_date {
      @media (min-width: $md3) {
        flex: 0 0 10%;
        min-width: 100px;
      }
    }

    &_type,
    &_game {
      @media (min-width: $md3) {
        flex: 0 0 10%;
        display: block;
        text-align: left;
      }
    }

    &_skin {
      @media (min-width: $md3) {
        flex: 1 1 100%;
        overflow: hidden;
        max-width: 300px;
      }

      span.hide {
        @media (max-width: $md3) {
          @include hide-item;
        }
      }
    }

    &_coinAmount,
    &_total {
      @media (min-width: $md3) {
        flex: 0 0 12%;
      }
      @media (min-width: $md3) {
        display: flex;
        justify-content: flex-start;
      }
      :deep(.price__value) {
        font-weight: 700 !important;
      }
    }
    &_quantity {
      @media (min-width: $md3) {
        flex: 0 0 10%;
      }

      span:last-child {
        font-weight: 700;
      }
    }

    &_status {
      @media (min-width: $md3) {
        flex: 0 0 10%;
        min-width: 100px;
      }
    }

    &_action {
      min-width: 103px;

      @media (max-width: $md3) {
        span:first-child {
          @include hide-item;
        }

        span:last-child {
          flex: 1 1 100% !important;
        }
      }
    }
  }
  &__date {
    &-time {
      @include hide-item;
    }
  }
  &__skins {
    &.full-size {
      flex: 0 1 50%;
    }

    @media (max-width: $md3) {
      overflow: hidden;
    }

    @media (max-width: $md6) {
      margin-left: 0;
    }
  }

  &__skin {
    display: flex;
    flex: 1 1 100%;
    min-width: 0;
    @include adaptiveValue('gap', 15, 10, 1440, 992, 1);

    &:not(:last-child) {
      margin-bottom: 10px;
    }

    &-wrapper {
      display: flex;
      justify-content: center;
      align-items: center;
      min-width: 75px;
      height: 50px;
      position: relative;
    }

    &-image {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
    }

    &-info {
      align-self: center;
      min-width: 0;
      flex: 1 1 auto;
    }

    &-quality,
    &-name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-family: var(--font-inter);
      font-size: 16px;
      line-height: 120%;
      font-weight: 400;
      color: var(--primary-color);
      text-align: left !important;
    }
  }

  &__status {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    line-height: 120%;
    font-family: var(--font-inter);
    font-weight: 400;
    @media (min-width: $md3) {
      justify-content: flex-start;
    }
    &-icon {
      width: 16px;
      min-width: 16px;
      height: 16px;
      color: currentColor;
    }

    &.is-warn {
      color: var(--pending-color) !important;
    }

    &.is-muted,
    &.is-danger {
      color: var(--error-color) !important;
    }

    &.is-success {
      color: var(--success-color) !important;
    }
  }
  &__price-formatter {
    @media (max-width: $md3) {
      margin-left: 0px;
      margin-right: auto;
      width: fit-content;
    }
    :deep(.price__value),
    :deep(.price__currency) {
      font-weight: 600 !important;
      line-height: 100% !important;
      font-family: var(--font-inter) !important;
      color: var(--primary-color) !important;
    }
  }
  &__pagination {
    :deep(.pagination) {
      justify-content: flex-end;
    }
  }
}
</style>

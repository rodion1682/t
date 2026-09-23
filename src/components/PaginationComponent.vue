<template>
  <div class="pagination">
    <button
      class="pagination__control"
      @click="changePage(currentPage - 1)"
      :disabled="currentPage === 1"
    >
      <SvgIcon :icon="ArrowDownIcon" class="pagination__control-icon" />
    </button>

    <div class="pagination__pages">
      <template v-for="(item, index) in displayedPages" :key="index">
        <button
          v-if="!item.isEllipsis"
          class="pagination__page"
          :class="{ 'is-active': currentPage === item.value }"
          @click="changePage(item.value)"
        >
          {{ item.value }}
        </button>

        <span v-else class="pagination__ellipsis">...</span>
      </template>
    </div>

    <button
      class="pagination__control"
      @click="changePage(currentPage + 1)"
      :disabled="currentPage === totalPages"
    >
      <SvgIcon
        :icon="ArrowDownIcon"
        class="pagination__control-icon pagination__control-icon_second"
      />
    </button>
  </div>
</template>

<script setup>
import { ArrowDownIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { computed } from 'vue'

const props = defineProps({
  totalPages: { type: Number, required: true },
  currentPage: { type: Number, required: true, default: 1 },
  maxDisplayedPages: { type: Number, default: 3 },
})

const emit = defineEmits(['update:current-page'])

const displayedPages = computed(() => {
  const pages = []

  if (props.totalPages <= props.maxDisplayedPages) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push({ value: i, isEllipsis: false })
    }
  } else {
    pages.push({ value: 1, isEllipsis: false })

    let startPage = Math.max(2, props.currentPage - 2)
    let endPage = Math.min(props.totalPages - 1, props.currentPage + 2)

    if (props.currentPage - 1 <= 3) endPage = 5
    if (props.totalPages - props.currentPage <= 3)
      startPage = props.totalPages - 4

    if (startPage > 2) pages.push({ value: null, isEllipsis: true })

    for (let i = startPage; i <= endPage; i++) {
      pages.push({ value: i, isEllipsis: false })
    }

    if (endPage < props.totalPages - 1)
      pages.push({ value: null, isEllipsis: true })

    pages.push({ value: props.totalPages, isEllipsis: false })
  }

  return pages
})

function changePage(page) {
  if (page >= 1 && page <= props.totalPages && page !== props.currentPage) {
    emit('update:current-page', page)
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.pagination {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 5px;
  @media (max-width: $md6) {
    justify-content: center;
    flex: 1 1 100%;
  }
  &__pages {
    display: flex;
    align-items: center;
    gap: 5px;
    @media (max-width: $md6) {
      width: 100%;
    }
  }
  &__control,
  &__page,
  &__ellipsis {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease 0s;
    background-color: transparent;
    @include adaptiveValue('border-radius', 15, 10);
    @include adaptiveValue('min-width', 50, 40);
    @include adaptiveValue('height', 50, 40);
    font-weight: 400;
    font-family: var(--font-inter);
    color: var(--secondary-color);
    background-color: transparent;
    border: 1px solid var(--border-primary-color);
    font-size: 16px;
    line-height: 150%;
    &:disabled {
      opacity: 0.5;
      pointer-events: none;
    }
    @media (max-width: $md6) {
      flex: 1 1 auto;
      max-width: none;
    }
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-primary-color);
      }
    }
    &-icon {
      color: inherit;
      min-width: 15px;
      height: 10px;
      transform: rotate(-180deg);
      &_second {
        transform: rotate(0deg);
      }
    }
  }
  &__control {
    background-color: var(--bg-secondary-color);
    color: var(--hint-primary-color);
    @media (any-hover: hover) {
      &:hover {
        color: var(--primary-color);
        background-color: var(--hint-primary-color);
      }
    }
    @media (max-width: $md6) {
      @include hide-item;
    }
  }
  &__page {
    min-width: fit-content;
    padding-left: 15px;
    padding-right: 15px;
    &.is-active {
      pointer-events: none;
      font-weight: 700;
      color: var(--hint-primary-color);
    }
  }

  &__ellipsis {
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
}
</style>

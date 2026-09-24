<template>
  <nav v-if="totalPages > 1" class="pagination" :aria-label="$t('Pagination')">
    <button
      type="button"
      class="pagination__item pagination__control"
      :disabled="currentPage <= 1"
      @click="changePage(currentPage - 1)"
    >
      {{ $t('Prev') }}
    </button>

    <template v-for="item in displayedPages" :key="item.key">
      <span v-if="item.type === 'ellipsis'" class="pagination__ellipsis">
        …
      </span>

      <button
        v-else
        type="button"
        class="pagination__item"
        :class="{
          pagination__item_active: item.value === currentPage,
        }"
        :aria-current="item.value === currentPage ? 'page' : undefined"
        @click="changePage(item.value)"
      >
        {{ item.value }}
      </button>
    </template>

    <button
      type="button"
      class="pagination__item pagination__control"
      :disabled="currentPage >= totalPages"
      @click="changePage(currentPage + 1)"
    >
      {{ $t('Next') }}
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  totalPages: {
    type: Number,
    required: true,
  },

  currentPage: {
    type: Number,
    required: true,
  },

  siblingCount: {
    type: Number,
    default: 1,
  },
})

const emit = defineEmits(['update:currentPage'])

const normalizedTotalPages = computed(() => {
  return Math.max(1, Number(props.totalPages) || 1)
})

const normalizedCurrentPage = computed(() => {
  return Math.min(
    Math.max(1, Number(props.currentPage) || 1),
    normalizedTotalPages.value,
  )
})

const createPage = value => ({
  type: 'page',
  value,
  key: `page-${value}`,
})

const createEllipsis = key => ({
  type: 'ellipsis',
  key: `ellipsis-${key}`,
})

const displayedPages = computed(() => {
  const total = normalizedTotalPages.value

  const current = normalizedCurrentPage.value

  const siblingCount = Math.max(0, Number(props.siblingCount) || 0)

  /*
   * Small page counts:
   *
   * Prev 1 2 3 4 5 Next
   */
  const maxVisiblePages = siblingCount * 2 + 5

  if (total <= maxVisiblePages) {
    return Array.from({ length: total }, (_, index) => createPage(index + 1))
  }

  const items = []

  const leftSibling = Math.max(current - siblingCount, 2)

  const rightSibling = Math.min(current + siblingCount, total - 1)

  /*
   * Always show page 1.
   */
  items.push(createPage(1))

  /*
   * Left side.
   */
  if (leftSibling > 2) {
    items.push(createEllipsis('left'))
  } else {
    for (let page = 2; page < leftSibling; page += 1) {
      items.push(createPage(page))
    }
  }

  /*
   * Current page + siblings.
   */
  for (let page = leftSibling; page <= rightSibling; page += 1) {
    items.push(createPage(page))
  }

  /*
   * Right side.
   */
  if (rightSibling < total - 1) {
    items.push(createEllipsis('right'))
  } else {
    for (let page = rightSibling + 1; page < total; page += 1) {
      items.push(createPage(page))
    }
  }

  /*
   * Always show last page.
   */
  items.push(createPage(total))

  return items
})

const changePage = page => {
  const nextPage = Math.min(
    Math.max(1, Number(page) || 1),
    normalizedTotalPages.value,
  )

  if (nextPage === normalizedCurrentPage.value) {
    return
  }

  emit('update:currentPage', nextPage)
}
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;

  flex-wrap: wrap;

  gap: 7px;

  width: 100%;

  &__item {
    display: inline-flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 auto;

    min-width: 38px;
    height: 38px;

    padding: 0 12px;

    border: 1px solid var(--cod-gray-07);

    border-radius: 999px;

    background: var(--merino);

    @include ibm-12-700;

    line-height: 1;

    color: var(--cod-gray);

    cursor: pointer;

    transition:
      color 0.2s ease,
      background-color 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease,
      opacity 0.2s ease;

    @media (any-hover: hover) {
      &:hover:not(:disabled):not(.pagination__item_active) {
        border-color: var(--kelp);

        background: var(--feta);

        transform: translateY(-1px);
      }
    }

    &:disabled {
      opacity: 0.4;

      cursor: default;
    }

    &_active {
      border-color: var(--kelp);

      background: var(--kelp);

      color: var(--janna);

      cursor: default;
    }
  }

  &__control {
    min-width: 52px;

    padding-right: 14px;
    padding-left: 14px;

    background: var(--feta);
  }

  &__ellipsis {
    display: flex;
    align-items: center;
    justify-content: center;

    flex: 0 0 20px;

    height: 38px;

    @include ibm-12-700;

    color: var(--soya-bean);

    user-select: none;
  }
}

@media (max-width: $md5) {
  .pagination {
    gap: 5px;

    &__item {
      min-width: 34px;
      height: 34px;

      padding-right: 9px;
      padding-left: 9px;

      font-size: 11px;
    }

    &__control {
      min-width: 48px;

      padding-right: 11px;
      padding-left: 11px;
    }

    &__ellipsis {
      flex-basis: 15px;

      height: 34px;

      font-size: 11px;
    }
  }
}
</style>

<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <template v-for="(c, idx) in crumbs" :key="idx">
      <RouterLink v-if="c.to" :to="c.to" class="breadcrumbs__item">
        {{ c.label }}

        <SvgIcon
          v-if="idx < crumbs.length - 1"
          :icon="ArrowIcon"
          class="breadcrumbs__arrow"
        />
      </RouterLink>

      <span v-else class="breadcrumbs__item breadcrumbs__item_last">
        {{ c.label }}
      </span>
    </template>
  </nav>
</template>

<script setup>
import { ArrowIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const { t } = useI18n()
const route = useRoute()

const props = defineProps({
  game: { type: String, default: '' },
  category: { type: String, default: '' },
  subcategory: { type: String, default: '' },
  productId: { type: [String, Number], default: null },
  productTitle: { type: String, default: '' },
})

const routeGame = computed(() => {
  // URL wins
  if (route.path.startsWith('/cs2')) return 'cs2'
  if (route.path.startsWith('/cs2')) return 'cs2'

  // fallback to prop if you ever mount it elsewhere
  const g = String(props.game || '').toLowerCase()
  if (g === 'cs2' || g === 'cs2') return g

  return ''
})

const crumbs = computed(() => {
  const g = routeGame.value

  const items = [
    { label: t('Home'), to: { name: 'HomePage' } },
    { label: t('Products'), to: { path: g ? `/${g}` : '/products' } },
  ]

  if (g) {
    items.push({
      label: g === 'cs2' ? 'DOTA 2' : 'CS2',
      to: { path: `/${g}` },
    })
  }

  // ✅ keep categories under the current game path
  if (props.category) {
    items.push({
      label: props.category,
      to: {
        path: g ? `/${g}/${props.category}` : `/products/${props.category}`,
      },
    })
  }

  if (props.subcategory) {
    items.push({
      label: props.subcategory,
      to: {
        path: g
          ? `/${g}/${props.category}/${props.subcategory}`
          : `/products/${props.category}/${props.subcategory}`,
      },
    })
  }

  if (props.productId) {
    items.push({
      label: props.productTitle || `#${props.productId}`,
      to: null,
    })
  }

  return items
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  @media (max-width: $md2) {
    padding-bottom: 10px;
    overflow-y: auto;
  }

  &__item {
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 3px;
    line-height: 1;
    transition: color 0.3s ease 0s;
    font-weight: 400;
    font-family: var(--font-inter);
    font-style: 14px;

    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-color);
      }
    }
  }

  &__item_last {
    white-space: nowrap;
    pointer-events: none;
    opacity: 0.8;

    @media (min-width: $md2) {
      max-width: 150px;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  &__arrow {
    min-width: 11px;
    height: 8px;
  }
}
</style>

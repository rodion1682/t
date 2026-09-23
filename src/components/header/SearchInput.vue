also change height when active:
<template>
  <div ref="shellRef" class="search-shell">
    <div
      ref="searchRef"
      class="search"
      :class="{
        active: isActive,
        floating: isFloating,
      }"
      :style="searchInlineStyles"
      @click="handleSearchClick"
    >
      <BaseInput
        v-model="searchValue"
        class="search__input"
        :placeholder="placeholder"
        actionable
        @enter="submitSearch"
        @action="submitSearch"
        @clear="clearSearch"
      >
        <template #prefix>
          <SvgIcon :icon="SearchIcon" class="search__input-icon" />
        </template>

        <template #suffix>
          <BaseButton
            v-if="searchValue"
            class="search__refresh"
            @click.stop="clearSearch"
          >
            <SvgIcon class="search__refresh-icon" :icon="RefreshIcon" />
          </BaseButton>
        </template>
      </BaseInput>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { RefreshIcon, SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { debounce } from 'lodash'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Enter your search term',
  },
  debounceDelay: {
    type: Number,
    default: 500,
  },
})

const route = useRoute()
const router = useRouter()

const MOBILE_WIDTH = 619.98
const ANIMATION_DURATION = 500
const MOBILE_COLLAPSED_WIDTH = 40
const MOBILE_SIDE_GAP = 10

const searchValue = ref('')
const isActive = ref(false)
const isFloating = ref(false)

const shellRef = ref(null)
const searchRef = ref(null)

const floatingLeft = ref(null)
const floatingTop = ref(null)
const floatingWidth = ref(null)

let closeTimeout = null
let animationFrame = null

const isMobileScreen = () => window.innerWidth < MOBILE_WIDTH

const searchInlineStyles = computed(() => {
  if (!isFloating.value) return {}

  return {
    left: floatingLeft.value !== null ? `${floatingLeft.value}px` : undefined,
    //top: floatingTop.value !== null ? `${floatingTop.value}px` : undefined,
    top: floatingTop.value !== null ? `5.5px` : undefined,
    width:
      floatingWidth.value !== null ? `${floatingWidth.value}px` : undefined,
    transform: isActive.value ? 'scaleX(1)' : 'scaleX(0.98)',
    opacity: isActive.value ? 1 : 0.96,
    zIndex: 13,
  }
})

const syncFromRoute = () => {
  searchValue.value = route.query.search ? String(route.query.search) : ''
}

const getShellRect = () => {
  if (!shellRef.value) return null
  return shellRef.value.getBoundingClientRect()
}

const getExpandedWidth = () => {
  return window.innerWidth - MOBILE_SIDE_GAP * 2
}

const clearTimers = () => {
  if (closeTimeout) {
    clearTimeout(closeTimeout)
    closeTimeout = null
  }

  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

const applyFloatingStartPosition = rect => {
  floatingLeft.value = rect.left
  floatingTop.value = rect.top
  floatingWidth.value = rect.width
}

const activateSearch = async () => {
  if (!isMobileScreen()) return
  if (!shellRef.value) return

  clearTimers()

  const rect = getShellRect()
  if (!rect) return

  isFloating.value = true
  applyFloatingStartPosition(rect)

  await nextTick()

  animationFrame = requestAnimationFrame(() => {
    floatingLeft.value = MOBILE_SIDE_GAP
    floatingTop.value = rect.top
    floatingWidth.value = getExpandedWidth()
    isActive.value = true
  })
}

const deactivateSearch = () => {
  if (!isFloating.value || !shellRef.value) {
    isActive.value = false
    isFloating.value = false
    return
  }

  clearTimers()

  const rect = getShellRect()
  if (!rect) {
    isActive.value = false
    isFloating.value = false
    return
  }

  isActive.value = false

  const currentRect = searchRef.value?.getBoundingClientRect()

  if (currentRect) {
    floatingLeft.value = currentRect.left
    floatingTop.value = currentRect.top
    floatingWidth.value = currentRect.width
  }

  animationFrame = requestAnimationFrame(() => {
    floatingLeft.value = rect.left
    floatingTop.value = rect.top
    floatingWidth.value = rect.width
  })

  closeTimeout = setTimeout(() => {
    isFloating.value = false
    floatingLeft.value = null
    floatingTop.value = null
    floatingWidth.value = null
  }, ANIMATION_DURATION)
}

const submitSearch = async () => {
  const trimmedSearch = searchValue.value.trim()
  const nextQuery = {
    ...route.query,
    page: '1',
  }

  if (trimmedSearch) {
    nextQuery.search = trimmedSearch
  } else {
    delete nextQuery.search
  }

  await router.replace({
    name: 'ProductListPage',
    query: nextQuery,
  })
}

const debouncedSubmit = debounce(() => {
  submitSearch()
}, props.debounceDelay)

const clearSearch = async () => {
  searchValue.value = ''

  const nextQuery = { ...route.query }
  delete nextQuery.search
  delete nextQuery.page

  await router.replace({
    name: 'ProductListPage',
    query: nextQuery,
  })

  if (isMobileScreen()) {
    deactivateSearch()
  }
}

const handleSearchClick = () => {
  if (!isMobileScreen()) return
  if (isActive.value || isFloating.value) return

  activateSearch()
}

const handleClickOutside = event => {
  if (!isMobileScreen()) return
  if (!searchRef.value) return
  if (!isActive.value && !isFloating.value) return

  if (!searchRef.value.contains(event.target)) {
    deactivateSearch()
  }
}

const handleResize = () => {
  if (!shellRef.value) return

  if (!isMobileScreen()) {
    clearTimers()
    isActive.value = false
    isFloating.value = false
    floatingLeft.value = null
    floatingTop.value = null
    floatingWidth.value = null
    return
  }

  const rect = getShellRect()
  if (!rect) return

  if (isFloating.value) {
    if (isActive.value) {
      floatingLeft.value = MOBILE_SIDE_GAP
      floatingTop.value = rect.top
      floatingWidth.value = getExpandedWidth()
    } else {
      floatingLeft.value = rect.left
      floatingTop.value = rect.top
      floatingWidth.value = rect.width
    }
  }
}

watch(
  () => route.query.search,
  () => {
    syncFromRoute()
  },
  { immediate: true },
)

watch(searchValue, (newValue, oldValue) => {
  if (newValue === oldValue) return

  const routeSearch = route.query.search ? String(route.query.search) : ''
  if (newValue.trim() === routeSearch.trim()) return

  debouncedSubmit()
})

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  clearTimers()
  debouncedSubmit.cancel()
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.search-shell {
  width: 100%;

  @media (min-width: $md4) {
    max-width: 262px;
  }

  @media (max-width: $md4) {
    max-width: 40px;
    min-width: 40px;
    @include adaptiveValue('min-height', 41, 40, 619.98, 320);
  }
}

.search {
  width: 100%;

  :deep(.base-input) {
    border-color: rgb(255, 255, 255, 0.05);
  }

  :deep(.base-input__suffix) {
    right: 0;
  }

  &__input {
    width: 100%;
  }

  &__refresh {
    display: flex;
    align-items: center;
    justify-content: center;
    @include adaptiveValue('min-height', 44, 40);
    @include adaptiveValue('min-width', 44, 40);
    @include adaptiveValue('max-width', 44, 40);
    @include adaptiveValue('border-radius', 12, 10);
  }

  &__refresh-icon {
    min-width: 20px;
    min-height: 19px;
  }

  &__input-icon {
    min-width: 16px;
    min-height: 16px;
    color: var(--primary-color);
  }

  @media (max-width: $md4) {
    max-width: 40px;

    :deep(.base-input) {
      width: 100%;
      max-width: 100%;
    }

    :deep(.base-input__prefix) {
      left: 10px;
    }

    &.floating {
      position: fixed;
      z-index: 13;
      max-width: none;
      transform-origin: left center;
      //will-change: left, top, width, transform, opacity;
      //transition:
      //  left 0.5s ease,
      //  top 0.5s ease,
      //  width 0.5s ease,
      //  transform 0.5s ease,
      //  opacity 0.5s ease;
      transition: all 0.5s ease 0s;
    }

    &.active {
      max-width: none;
    }
  }
}
</style>

<template>
  <div class="relative inline-block" ref="profileDropdownRef">
    <div
      class="relative mx-[15px] flex size-[30px] cursor-pointer items-center justify-center rounded border border-accent-gray bg-modal transition-colors hover:bg-accent-gray/20"
      @click="toggleDropdown"
    >
      <SvgIcon :icon="UserIcon" class="size-[18px] text-primary" />
    </div>

    <transition name="fade">
      <div
        v-if="isOpen"
        :style="dropdownStyle"
        class="absolute top-[calc(100%+12px)] z-[100] w-52 rounded-large border border-border-modal bg-background-modal shadow-lg"
      >
        <div
          :style="arrowStyle"
          class="absolute h-3 w-3 rotate-45 border-l border-t border-border-modal bg-background-modal"
        ></div>

        <div class="p-4">
          <router-link
            :to="{ name: 'account-profile' }"
            class="mb-2 flex items-center rounded-small px-3 py-2 text-secondary no-underline transition-colors hover:bg-accent-gray/10 hover:text-primary"
            @click="isOpen = false"
          >
            <span class="text-sm font-medium">
              {{ $t('My profile') }}
            </span>
          </router-link>

          <router-link
            :to="{ name: 'account-order-history' }"
            class="mb-2 flex items-center rounded-small px-3 py-2 text-secondary no-underline transition-colors hover:bg-accent-gray/10 hover:text-primary"
            @click="isOpen = false"
          >
            <span class="text-sm font-medium">
              {{ $t('Order history') }}
            </span>
          </router-link>

          <!-- <router-link
            :to="{ name: 'account-transactions' }"
            class="mb-2 flex items-center rounded-small px-3 py-2 text-secondary no-underline transition-colors hover:bg-accent-gray/10 hover:text-primary"
            @click="isOpen = false"
          >
            <span class="text-sm font-medium">
              {{ $t('Payment history') }}
            </span>
          </router-link>

          <router-link
            v-if="settingsStore.settings?.offer_enabled"
            :to="{ name: 'account-offers' }"
            class="mb-2 flex items-center rounded-small px-3 py-2 text-secondary no-underline transition-colors hover:bg-accent-gray/10 hover:text-primary"
            @click="isOpen = false"
          >
            <span class="text-sm font-medium">
              {{ $t('Sell skins') }}
            </span>
          </router-link> -->

          <div class="mt-2 border-t border-border pt-2">
            <button
              class="flex w-full items-center rounded-small px-3 py-2 text-secondary transition-colors hover:bg-error/10 hover:text-error"
              @click="handleLogout"
            >
              <span class="text-sm font-medium">
                {{ $t('Log out') }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useWindowSize, onClickOutside } from '@vueuse/core'
import { useUserStore } from '@/stores/user'
import { useSettingsStore } from '@/stores/settings'
import { UserIcon } from './icons'
import SvgIcon from './icons/SvgIcon.vue'

const userStore = useUserStore()
const settingsStore = useSettingsStore()
const emit = defineEmits(['logout'])

const isOpen = ref(false)
const profileDropdownRef = ref<HTMLElement | null>(null)
const { width } = useWindowSize()

const dropdownStyle = computed(() => {
  return width.value < 768
    ? { right: '0', left: 'auto' }
    : { right: '-8px', left: 'auto' }
})

const arrowStyle = computed(() => {
  const rightPos = width.value < 768 ? '20px' : '20px'
  return {
    top: '-6px',
    right: rightPos,
    transform: 'rotate(45deg)',
  }
})

const toggleDropdown = () => (isOpen.value = !isOpen.value)
const hideDropdown = () => (isOpen.value = false)

const handleLogout = () => {
  emit('logout')
  hideDropdown()
}

onClickOutside(profileDropdownRef, e => {
  if (!profileDropdownRef.value?.contains(e.target as Node)) hideDropdown()
})

const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') hideDropdown()
}

onMounted(() => document.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => document.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s ease-out,
    transform 0.2s ease-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

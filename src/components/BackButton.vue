<!-- components/BackButton.vue -->
<script setup lang="ts">
import SvgIcon from '@/components/icons/SvgIcon.vue'

defineEmits(['click'])
</script>

<template>
  <button
    class="flex items-center gap-2 text-sm hover:opacity-80"
    @click="$emit('click')"
  >
    <SvgIcon direction="left" />
    <slot />
  </button>
</template>

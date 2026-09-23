<script setup>
import { twMerge } from 'tailwind-merge'

defineProps({
  class: { type: [String, Array, Object], default: '' },
  hideTopDecoration: { type: Boolean, default: false },
  hideBottomDecoration: { type: Boolean, default: false },
  hideLeftAccent: { type: Boolean, default: false },
})
</script>

<template>
  <div
    :class="[
      twMerge(
        'relative h-fit rounded-[10px] border border-accent bg-[#13161F] p-6 lg:p-[36px_32px_57px]',
        $props.class,
      ),
    ]"
  >
    <div
      v-if="!hideTopDecoration"
      class="absolute -top-[10px] left-4 h-[4px] w-[34px] rounded-[10px] border border-white"
    ></div>

    <div v-if="!hideBottomDecoration" class="absolute -bottom-[10px] right-[0px] flex gap-2">
      <div class="h-[4px] w-[4px] rounded-[10px] border border-white"></div>
      <div class="h-[4px] w-[76px] rounded-[10px] border border-white"></div>
      <div class="h-[4px] w-[34px] rounded-[10px] border border-white"></div>
    </div>

    <div
      v-if="!hideLeftAccent"
      class="absolute bottom-0 left-0 top-1/2 flex h-[82px] w-1 -translate-y-1/2 items-center justify-center"
      style="clip-path: polygon(100% 7%, 0 0, 0 100%, 100% 93%)"
    >
      <div class="h-[82px] w-1 bg-accent"></div>
    </div>

    <slot />
  </div>
</template>

<template>
  <div class="svg-icon" :class="class" v-html="icon" />
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    required: true,
  },
  class: {
    type: [String, Array, Object],
    default: '',
  },
})
</script>

<style lang="scss">
.svg-icon {
  position: relative;
  svg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
}
</style>

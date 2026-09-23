<template>
  <span :class="['loader', className]"></span>
</template>

<script setup>
defineProps({
  className: {
    type: String,
    default: '',
  },
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.loader {
  margin: auto;
  border-style: solid;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
  border-color: var(--primary-color);
  border-bottom-color: transparent;
  border-width: 5px;
  min-width: 50px;
  max-width: 50px;
  min-height: 50px;
  max-height: 50px;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

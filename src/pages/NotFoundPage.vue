<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goHome = () => router.push('/')
</script>

<template>
  <div class="not-found">
    <div class="not-found__inner _cnt">
      <h1 class="not-found__code _h1">404</h1>
      <h2 class="not-found__title _h2">{{ $t(`Oops! Page Not Found`) }}</h2>
      <div class="not-found__text _l">
        {{ $t(`Sorry, the page you are looking for does not exist.`) }}
      </div>
      <BaseButton class="not-found__button" @click="goHome" variant="bordered">
        {{ $t(`Go Back Home`) }}
      </BaseButton>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.not-found {
  @include adaptiveValue('padding-top', 50, 25);
  @include adaptiveValue('padding-bottom', 50, 25);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1 1 100%;
  &__inner {
    text-align: center;
  }
  &__code {
    margin-bottom: 10px;
  }
  &__title {
    text-align: center;
    font-weight: 700;
    @include adaptiveValue('font-size', 48, 22);
    &:not(:last-child) {
      margin-bottom: 10px;
    }
  }
  &__text {
    color: var(--secondary-color);
    font-weight: 700;

    &:not(:last-child) {
      margin-bottom: 20px;
    }
  }
  &__button {
    justify-content: center !important;
    max-width: 300px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>

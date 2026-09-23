<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
</script>

<template>
  <section class="listing">
    <div class="listing__inner _cnt">
      <div class="listing__bg _ibg">
        <img src="@/assets/img/listing-bg.jpg" />
      </div>
      <div class="listing__content">
        <div class="listing__label">
          {{ $t('Sheet 01 · Where the skins come from') }}
        </div>
        <div class="listing__title">
          <div>{{ $t('Every listing is a real') }}</div>
          <div>{{ $t('inventory, checked') }}</div>
          <div>{{ $t('before it goes live') }}</div>
        </div>
        <BaseButton class="listing__button">
          {{ $t('How checks work') }}
        </BaseButton>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.listing {
  &__inner {
    @include adaptiveValue('border-radius', 38, 20);
    position: relative;
    overflow: hidden;
  }

  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }

  &__content {
    @include adaptiveValue('padding-top', 121, 25);
    @include adaptiveValue('padding-bottom', 121, 25);
    position: relative;
    z-index: 1;
    text-shadow: 1px 1px 1px var(--chrome-white);
  }

  &__label {
    @include ibm-12-700;
    color: var(--hemlock);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 16, 6);
    }
  }

  &__title {
    @include sg-36-700;
    color: var(--cod-gray);
    &:not(:last-child) {
      margin-bottom: 16px;
    }
  }

  &__button {
    max-width: 163px;
  }
}
</style>

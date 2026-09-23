<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import BaseInput from '@/components/base/BaseInput.vue'
import { SearchIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { useGame } from '@/composables/useGame'

const { marketRoute } = useGame()
</script>

<template>
  <section class="hero">
    <div class="hero__inner _cnt">
      <div class="hero__top top">
        <div class="top__label">{{ $t('Counter-Strike 2 skin market') }}</div>
        <div class="top__title">
          <div>{{ $t('Trade CS2 skins in') }}</div>
          <div>{{ $t('the open') }}</div>
        </div>
        <div class="top__text">
          {{
            $t(
              'Live prices and the full history of every item. Float, pattern and the last five sales sit on the card — before you buy, not after.',
            )
          }}
        </div>
      </div>
      <div class="hero__body body">
        <BaseInput class="body__search">
          <template #suffix>
            <SvgIcon :icon="SearchIcon" class="body__search-icon" />
          </template>
          <template #prefix>
            <BaseButton class="body__search-button">{{
              $t('Search')
            }}</BaseButton>
          </template>
        </BaseInput>
        <div class="body__categories">
          <div class="body__label">{{ $t('Popular:') }}</div>
          <div class="body__items">
            <div class="body__item">{{ $t('') }}</div>
          </div>
        </div>
        <div class="body__images">
          <div class="body__wrapper-image"></div>
          <div class="body__image _ibg-contain">
            <img src="" />
          </div>
        </div>
        <div class="body__stats">
          <div class="body__stats">
            <div>{{ $t('') }}</div>
            <span>{{ $t('') }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.hero {
  @include adaptiveValue('padding-top', 190, 25);
  @include adaptiveValue('padding-bottom', 410, 50);
  position: relative;
  &__image {
    position: absolute;
    z-index: 5;
    left: 54%;
    transform: translate(-50%, 0px);
    height: 95%;
    width: 40%;
    @include adaptiveValue('top', 30, 0);
    @include adaptiveValue('bottom', 40, 0);
    @media (max-width: $md2) {
      opacity: 0.8;
    }
    @media (max-width: $md4) {
      left: 45%;
    }
  }

  &__knife {
    z-index: 4;
    position: absolute;
    width: 11%;
    aspect-ratio: 1/ 0.75;
    &_left {
      left: 3%;
      bottom: 18%;
    }

    &_right {
      right: 3%;
      top: 18%;
    }
  }

  &__ellipse {
    z-index: 3;
    position: absolute;
    width: 50%;
    aspect-ratio: 1;
    &_left {
      top: -10%;
      left: -5%;
    }

    &_right {
      bottom: 0%;
      right: -15%;
    }
  }

  &__texture {
    position: absolute;
    z-index: 2;
    height: 100%;
    left: 54%;
    top: 0;
    transform: translate(-50%, -5%) rotate(-1deg);
    width: 100%;
    @media (max-width: $md4) {
      height: 150%;
      width: 150%;
      transform: translate(-55%, -20%) rotate(-1deg);
    }
  }

  &__bg {
    z-index: 1;
    position: absolute;
    width: 100%;
    height: 90%;
    top: 0;
    left: 50%;
    transform: translate(-50%, 0px);
  }

  &__inner {
    position: relative;
    z-index: 6;
  }

  &__title {
  }

  &__info {
    max-width: 345px;
    margin-left: auto;
    @include adaptiveValue('margin-top', -57, 18);
  }

  &__text {
    text-shadow: 1px 1px 1px var(--bg-primary-color);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__action {
    :deep(.btn) {
      background-color: var(--bg-primary-color);
    }
  }
}
</style>

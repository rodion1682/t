<script setup>
import BaseButton from '@/components/base/BaseButton.vue'
import { useGame } from '@/composables/useGame'

const { marketRoute } = useGame()
</script>

<template>
  <section class="start">
    <div class="start__inner _cnt">
      <div class="start__iamge start__iamge_left _ibg-contain">
        <img src="@/assets/img/start-01.png" />
      </div>
      <div class="start__iamge start__iamge_right _ibg-contain">
        <img src="@/assets/img/start-02.png" />
      </div>
      <div class="start__info">
        <div class="start__title _h2">
          {{ $t('Find Your Next Favorite Skin') }}
        </div>
        <div class="start__text">
          {{
            $t(
              'Whether you`re looking for a rare knife, a clean AK-47 finish, or the perfect gloves to complete your loadout, High Skins makes it easy to find your next addition.',
            )
          }}
        </div>
        <RouterLink :to="marketRoute" class="start__link">
          <BaseButton variant="bordered">{{ $t('Explore Skins') }}</BaseButton>
        </RouterLink>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.start {
  position: relative;
  z-index: 1;
  background-color: var(--bg-primary-color);
  @include adaptiveValue('padding-top', 120, 0);
  @include adaptiveValue('margin-top', 0, -25);
  @include adaptiveValue('padding-bottom', 170, 25);
  &__inner {
    position: relative;
  }

  &__iamge {
    width: 16vw;
    position: absolute;
    top: 50%;
    aspect-ratio: 1;
    transform: translate(0px, -50%);
    @media (max-width: $md2) {
      opacity: 0.8;
    }
    &_left {
      left: -5%;
    }

    &_right {
      right: -5%;
    }
  }

  &__info {
    text-align: center;
    position: relative;
    z-index: 1;
    text-shadow: 1px 1px 1px var(--bg-primary-color);
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__text {
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__link {
    display: block;
    max-width: 340px;
    margin: 0 auto;
  }
}
</style>

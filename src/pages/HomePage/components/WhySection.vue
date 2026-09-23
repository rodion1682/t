<script setup></script>

<template>
  <section class="why">
    <div class="why__inner _cnt">
      <div class="why__image why__image_left _ibg-contain">
        <img src="@/assets/img/why-01.png" />
      </div>
      <div class="why__image why__image_right _ibg-contain">
        <img src="@/assets/img/why-02.png" />
      </div>
      <div class="why__info">
        <div class="why__title _h2">
          {{ $t('Why High Skins?') }}
        </div>
        <div class="why__text">
          {{
            $t(
              'High Skins is designed for players who want quality, variety, and a better way to discover CS2 skins. We bring together a carefully selected collection, competitive prices, and a seamless experience for both casual players and collectors.',
            )
          }}
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.why {
  &__inner {
    @include adaptiveValue('padding-top', 130, 25);
    @include adaptiveValue('padding-bottom', 240, 0);
    @include adaptiveValue('margin-bottom', 0, -25);
    position: relative;
  }

  &__image {
    position: absolute;
    top: 0;
    width: 33.5vw;
    height: 63vh;
    &_left {
      left: -12%;
    }

    &_right {
      right: -12%;
    }
    @media (max-width: $md4) {
      opacity: 0.8;
    }
  }

  &__info {
    position: relative;
    z-index: 1;
    text-align: center;
    max-width: 500px;
    margin: 0 auto;
    text-shadow: 1px 1px 1px var(--bg-primary-color);
  }

  &__title {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 30, 18);
    }
  }

  &__text {
  }
}
</style>

<script setup></script>

<template>
  <section class="how">
    <div class="how__inner _cnt">
      <div class="how__title _h2">{{ $t('How It Works') }}</div>
      <div class="how__items">
        <div class="how__item">
          <div class="how__image _ibg-cotnain">
            <img src="@/assets/img/how-01.png" />
          </div>
          <div class="how__number _text-gradient">01</div>
          <div class="how__label _h4">{{ $t('Explore the Collection') }}</div>
          <div class="how__text">
            {{
              $t(
                'Discover thousands of CS2 skins across a wide range of finishes, conditions, and categories.',
              )
            }}
          </div>
        </div>
        <div class="how__item">
          <div class="how__image _ibg-cotnain">
            <img src="@/assets/img/how-02.png" />
          </div>
          <div class="how__number _text-gradient">02</div>
          <div class="how__label _h4">{{ $t('Find Your Match') }}</div>
          <div class="how__text">
            {{
              $t(
                'Browse, search, and filter through the collection to find skins that fit your style and budget.',
              )
            }}
          </div>
        </div>
        <div class="how__item">
          <div class="how__image _ibg-cotnain">
            <img src="@/assets/img/how-03.png" />
          </div>
          <div class="how__number _text-gradient">03</div>
          <div class="how__label _h4">{{ $t('Checkout Securely') }}</div>
          <div class="how__text">
            {{
              $t(
                'Place your order through a fast and secure checkout designed for a smooth experience.',
              )
            }}
          </div>
        </div>
        <div class="how__item">
          <div class="how__image _ibg-cotnain">
            <img src="@/assets/img/how-04.png" />
          </div>
          <div class="how__number _text-gradient">04</div>
          <div class="how__label _h4">{{ $t('Elevate Your Inventory') }}</div>
          <div class="how__text">
            {{
              $t(
                'Add your new skins to your collection and take your CS2 loadout to the next level.',
              )
            }}
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

.how {
  @include adaptiveValue('padding-top', 60, 25);
  @include adaptiveValue('padding-bottom', 120, 25);

  &__inner {
  }

  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 40, 18);
    }
  }

  &__items {
    display: grid;
    @include adaptiveValue('gap', 20, 10);
    grid-template-columns: repeat(4, 1fr);
    @media (max-width: $md2) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: $md4) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__item {
    position: relative;
    padding-top: 10px;
    padding-bottom: 10px;
    @include adaptiveValue('padding-left', 30, 10);
    @include adaptiveValue('padding-right', 30, 10);
    @include adaptiveValue('border-radius', 20, 10);
    border: 1px solid var(--border-primary-color);
    background-color: var(--bg-third-color);
  }

  &__image {
    position: absolute;
    width: 53%;
    aspect-ratio: 1;
    top: 8%;
    right: 5%;
  }
  &__number,
  &__text,
  &__label {
    position: relative;
    z-index: 1;
  }

  &__number {
    font-family: var(--font-montserrat);
    font-weight: 900;
    @include adaptiveValue('font-size', 100, 50);
    line-height: 100%;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__label {
    &:not(:last-child) {
      margin-bottom: 15px;
    }
  }

  &__text {
  }
}
</style>

<script setup>
import { useGame } from '@/composables/useGame'

const { marketRoute } = useGame()
</script>

<template>
  <section id="how-it-works" class="how">
    <div class="how__inner _cnt">
      <div class="how__top">
        <div class="how__label">{{ $t('How it works') }}</div>
        <div class="how__title">
          <div>{{ $t('No bots. A person checks every') }}</div>
          <div>{{ $t('trade') }}</div>
        </div>
      </div>
      <div class="how__items">
        <div class="how__item">
          <div class="how__number">01</div>
          <div class="how__subtitle">{{ $t('Create an account') }}</div>
          <div class="how__text">
            {{
              $t(
                'Email and password, nothing else. Paste your Steam trade link into your profile whenever you are ready to buy.',
              )
            }}
          </div>
        </div>
        <div class="how__item">
          <div class="how__number">02</div>
          <div class="how__subtitle">{{ $t('Pick the exact item') }}</div>
          <div class="how__text">
            {{
              $t(
                'Filter by float, pattern and price history. What you see on the card is the item you get.',
              )
            }}
          </div>
        </div>
        <div class="how__item">
          <div class="how__number how__number_last">03</div>
          <div class="how__subtitle">
            {{ $t('We check it and send the offer') }}
          </div>
          <div class="how__text">
            {{
              $t(
                'A person confirms the item is in stock and matches the listing, then sends the trade offer to your link. You get an email when it goes out.',
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
@use '@/assets/styles/fonts' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.how {
  @include adaptiveValue('padding-top', 90, 25);
  @include adaptiveValue('padding-bottom', 60, 25);
  &__inner {
  }

  &__top {
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 36, 18);
    }
  }

  &__label {
    @include ibm-12-700;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 9, 5);
    }
  }

  &__title {
    @include sg-40-700;
  }

  &__items {
    display: grid;
    @include adaptiveValue('gap', 24, 10);
    grid-template-columns: repeat(3, 1fr);
    @media (max-width: $md2) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: $md4) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__item {
    @include adaptiveValue('border-radius', 32, 20);
    background-color: var(--double-spanish-white);
    @include adaptiveValue('padding', 28, 15);
  }

  &__number {
    width: fit-content;
    @include adaptiveValue('min-width', 56, 40);
    @include adaptiveValue('height', 56, 40);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #8fa073;
    @include sg-18-400;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 22, 10);
    }
    &_last {
      background-color: var(--copper);
    }
  }

  &__subtitle {
    @include sg-22-700;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 9, 5);
    }
  }

  &__text {
    @include ibm-14-400;
  }
}
</style>

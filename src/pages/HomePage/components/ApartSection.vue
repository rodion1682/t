<script setup></script>

<template>
  <section class="apart">
    <div class="apart__bg _ibg">
      <img src="@/assets/img/apart-bg.png" />
    </div>
    <div class="apart__inner _cnt-home">
      <div class="apart__title _h2">
        {{ $t('What sets us apart:') }}
      </div>
      <div class="apart__items">
        <div class="apart__item">
          <div class="apart__image _ibg-contain">
            <img src="@/assets/img/apart-05.svg" />
          </div>
          <div class="apart__label _h4">
            <div>
              {{ $t('Secure') }}
            </div>
            <div>{{ $t('transactions') }}</div>
          </div>
        </div>
        <div class="apart__item">
          <div class="apart__image _ibg-contain">
            <img src="@/assets/img/apart-01.svg" />
          </div>
          <div class="apart__label _h4">
            <div>
              {{ $t('Competitive') }}
            </div>
            <div>{{ $t('market prices') }}</div>
          </div>
        </div>
        <div class="apart__item">
          <div class="apart__image _ibg-contain">
            <img src="@/assets/img/apart-02.svg" />
          </div>
          <div class="apart__label _h4">
            <div>{{ $t('Smooth and') }}</div>
            <div>{{ $t('intuitive experience') }}</div>
          </div>
        </div>
        <div class="apart__item">
          <div class="apart__image _ibg-contain">
            <img src="@/assets/img/apart-03.svg" />
          </div>
          <div class="apart__label _h4">
            <div>{{ $t('Extensive CS2') }}</div>
            <div>{{ $t('collection') }}</div>
          </div>
        </div>
        <div class="apart__item">
          <div class="apart__image _ibg-contain">
            <img src="@/assets/img/apart-04.svg" />
          </div>
          <div class="apart__label _h4">
            <div>{{ $t('Regularly updated ') }}</div>
            <div>{{ $t('inventory') }}</div>
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

.apart {
  @include adaptiveValue('padding-top', 140, 100);
  @include adaptiveValue('padding-bottom', 170, 100);
  position: relative;
  z-index: 1;
  &__bg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
  }
  &__inner {
    position: relative;
    z-index: 1;
  }

  &__title {
    text-align: center;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 60, 18);
    }
  }

  &__items {
    display: grid;
    @include adaptiveValue('gap', 20, 10);
    grid-template-columns: repeat(5, 1fr);
    @media (max-width: $md2) {
      grid-template-columns: repeat(2, 1fr);
    }
    @media (max-width: $md6) {
      grid-template-columns: repeat(1, 1fr);
    }
  }

  &__item {
    text-align: center;
  }

  &__image {
    width: fit-content;
    margin-left: auto;
    margin-right: auto;
    @include adaptiveValue('min-width', 50, 40);
    @include adaptiveValue('height', 50, 40);
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 20, 18);
    }
  }

  &__label {
    @media (max-width: $md6) {
      div {
        display: inline;
        &:not(:last-child) {
          margin-right: 5px;
        }
      }
    }
  }
}
</style>

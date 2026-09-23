<template>
  <div class="sell-skin">
    <div class="sell-skin__inner _cnt">
      <div class="sell-skin__form">
        <div class="sell-skin__box">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.sell-skin {
  position: relative;
  overflow: hidden;
  flex: 1 1 100%;
  align-items: center;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-primary-color);
  @include adaptiveValue('padding-top', 190, 75);
  @include adaptiveValue('padding-bottom', 100, 25);
  &__inner {
    flex: 1 1 100%;
    width: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    position: relative;
    @media (max-width: $md7) {
      padding: 0px;
    }
  }

  &__form {
    margin: 0 auto;
    position: relative;
    z-index: 2;
    width: 100%;
    max-width: 466px;
    border-radius: 25px;
    @include adaptiveValue('padding-top', 60, 15);
    @include adaptiveValue('padding-bottom', 60, 15);
    padding-left: 10px;
    padding-right: 10px;
    @include bg-glass-blured;
  }
  &__box {
    max-width: 386px;
    margin: 0 auto;
  }
}
</style>

<template>
  <div class="auth">
    <div class="auth__texture _ibg-contain">
      <img src="@/assets/img/auth-texture.svg" />
    </div>
    <div class="auth__image _ibg-contain">
      <img src="@/assets/img/hero.png" />
    </div>
    <div class="auth__inner _cnt">
      <div class="auth__form" :class="formClass">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  page: {
    type: String,
    default: 'sign-in', // sign-in | sign-up
  },
  formClass: {
    type: [String, Array, Object],
    default: '',
  },
})
</script>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.auth {
  display: flex;
  flex-direction: column;
  flex: 1 1 100%;
  align-items: center;
  position: relative;
  z-index: 2;
  @include adaptiveValue('padding-top', 80, 25);
  @include adaptiveValue('padding-bottom', 80, 25);
  &__texture {
    position: absolute;
    z-index: 1;
    height: 110%;
    left: 24%;
    top: -2%;
    transform: translate(-50%, -5%) rotate(-2deg);
    width: 100%;
    @media (max-width: $md4) {
      height: 150%;
      width: 150%;
      transform: translate(-55%, -20%) rotate(-1deg);
    }
  }

  &__image {
    position: absolute;
    z-index: 2;
    left: 10%;
    height: 103%;
    width: 36%;
    bottom: -3%;
    @media (max-width: $md2) {
      opacity: 0.8;
    }
    @media (max-width: $md4) {
      height: 100%;
      width: 100%;
      left: -25%;
    }
  }
  &__inner {
    width: 100%;
    align-self: center;
    margin: auto;
  }

  &__form {
    position: relative;
    z-index: 3;
    max-width: 466px;
    margin-left: auto;
    @include adaptiveValue('margin-right', 122, 0, 1440, 620, 1);
  }
}
</style>

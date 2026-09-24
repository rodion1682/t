<template>
  <div class="auth">
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
  showInfo: {
    type: Boolean,
    default: false,
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
  @include adaptiveValue('padding-top', 70, 25);
  @include adaptiveValue('padding-bottom', 100, 25);
  &__inner {
    width: 100%;
    align-self: center;
    margin: auto;
  }

  &__form {
    @media (max-width: $md4) {
      margin-left: -10px;
      margin-right: -10px;
    }
  }
}
</style>

<script setup>
import CategorySection from '@/pages/HomePage/components/CategorySection.vue'
import HeroSection from '@/pages/HomePage/components/HeroSection.vue'
import ApartSection from './components/ApartSection.vue'
import HowSection from './components/HowSection.vue'
import StartSection from './components/StartSection.vue'
import WhySection from './components/WhySection.vue'
</script>

<template>
  <div class="home">
    <div class="home__block home__block_1">
      <HeroSection />
      <CategorySection />
    </div>
    <HowSection />
    <WhySection />
    <ApartSection />
    <StartSection />
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;
@use '@/assets/styles/components/classes' as *;

.home {
  &__block {
    &_1 {
      background-image: url('@/assets/img/noise-bg.svg');
      background-repeat: repeat-y;
      background-position: top center;
      background-size: 100% auto;
    }
  }
}
</style>

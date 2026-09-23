<template>
  <BaseDdropdown v-bind="$attrs" :label="label" class="hero-dropdown">
    <div class="hero-dropdown__list">
      <button
        v-for="hero in heroes"
        :key="hero"
        type="button"
        class="hero-dropdown__item"
        @click="selectHero(hero)"
      >
        {{ hero }}
      </button>
    </div>
  </BaseDdropdown>
</template>

<script setup>
import axios from '@/plugins/axios'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseDdropdown from './BaseDdropdown.vue'

defineOptions({
  inheritAttrs: false,
})

const props = defineProps({
  label: {
    type: String,
    default: 'Heroes',
  },
  category: {
    type: String,
    default: 'cs2',
  },
  routeName: {
    type: String,
    default: 'ProductListPage',
  },
  queryKey: {
    type: String,
    default: 'heroes',
  },
})

const router = useRouter()
const heroes = ref([])

const fetchHeroes = async () => {
  try {
    const { data } = await axios.get('/items/filter-data', {
      params: {
        category: props.category,
      },
    })

    if (data?.status === 'OK') {
      heroes.value = data?.payload?.heroes || []
    } else {
      heroes.value = []
    }
  } catch (error) {
    console.error('fetchHeroes error:', error)
    heroes.value = []
  }
}

const selectHero = async hero => {
  await router.push({
    name: props.routeName,
    query: {
      [props.queryKey]: hero,
      page: '1',
    },
  })
}

onMounted(() => {
  fetchHeroes()
})
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;

.hero-dropdown {
  &__list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 300px;
    overflow-y: auto;
  }

  &__item {
    width: 100%;
    text-align: left;
    padding: 10px 12px;
    border-radius: 6px;
    transition: 0.3s ease;
    text-transform: capitalize;

    @media (any-hover: hover) {
      &:hover {
        background-color: var(--hint-color);
        color: var(--bg-primary-color);
      }
    }
  }
}
</style>

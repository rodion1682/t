<template>
  <BaseModal
    :show="show"
    modal-container-class="hero-modal__inner"
    @update:show="emit('update:show', $event)"
    @close="handleClose"
  >
    <div class="hero-modal">
      <div class="hero-modal__title _h3">{{ $t('search by hero') }}</div>

      <div v-if="loading" class="hero-modal__state">
        {{ $t('Loading...') }}
      </div>

      <div v-else-if="!heroes.length" class="hero-modal__state">
        {{ $t('No heroes found') }}
      </div>

      <div v-else class="hero-modal__list">
        <button
          v-for="hero in heroes"
          :key="hero"
          type="button"
          class="hero-modal__item"
          @click="handleSelect(hero)"
        >
          {{ hero }}
        </button>
      </div>
    </div>
  </BaseModal>
</template>

<script setup>
import BaseModal from '@/components/base/BaseModal.vue'
import axios from '@/plugins/axios'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
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

const emit = defineEmits(['update:show', 'close', 'select'])

const router = useRouter()

const heroes = ref([])
const loading = ref(false)
const loaded = ref(false)

const fetchHeroes = async () => {
  if (loaded.value) return

  loading.value = true

  try {
    const { data } = await axios.get('/items/filter-data', {
      params: {
        category: props.category,
      },
    })

    heroes.value = data?.status === 'OK' ? data.payload?.heroes || [] : []
    loaded.value = true
  } catch (error) {
    console.error('fetchHeroes error:', error)
    heroes.value = []
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  emit('close')
  emit('update:show', false)
}

const handleSelect = async hero => {
  emit('select', hero)
  emit('update:show', false)

  await router.push({
    name: props.routeName,
    query: {
      [props.queryKey]: hero,
      page: '1',
    },
  })
}

watch(
  () => props.show,
  async value => {
    if (value) {
      await fetchHeroes()
    }
  },
)
</script>

<style scoped lang="scss">
@use '@/assets/styles/mixins' as *;
@use '@/assets/styles/media' as *;

.hero-modal {
  &__title {
    text-align: center;
    opacity: 0.7;
    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 25, 15);
    }
  }

  &__state {
    text-align: center;
    opacity: 0.7;
  }

  &__list {
    display: flex;
    flex-wrap: wrap;
  }

  &__item {
    display: flex;
    align-items: flex-start;
    flex: 0 1 25%;
    text-align: left;
    text-transform: capitalize;
    font-weight: 900;
    line-height: 120%;
    transition: color 0.3s ease 0s;
    color: var(--primary-color);
    @include adaptiveValue('padding-top', 8, 6);
    @include adaptiveValue('padding-bottom', 8, 6);
    @include adaptiveValue('padding-right', 20);
    background-color: transparent;
    @media (any-hover: hover) {
      &:hover {
        color: var(--hint-color);
      }
    }
    @media (max-width: $md3) {
      flex: 0 1 33.333%;
    }
    @media (max-width: $md4) {
      flex: 0 1 50%;
    }
  }
}
</style>

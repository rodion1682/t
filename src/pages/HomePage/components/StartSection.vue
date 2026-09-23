<script setup>
import { useRouter } from 'vue-router'

import BaseButton from '@/components/base/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()

const { t } = useI18n()

const stats = [
  {
    value: '0%',
    label: t('Deposit fee'),
  },
  {
    value: '24/7',
    label: t('Support in chat'),
  },
  {
    value: '2.1M',
    label: t('Trades settled'),
  },
  {
    value: t('7 days'),
    label: t('Price-drop guard'),
  },
]

const createAccount = () => {
  router.push({
    name: 'RegisterPage',
  })
}

const browseSkins = () => {
  router.push({
    name: 'ProductListPage',
    query: {
      category: 'cs2',
    },
  })
}
</script>

<template>
  <section class="start">
    <div class="start__inner _cnt">
      <div class="start__card">
        <div class="start__content">
          <div class="start__title">
            <div>
              {{ $t('Start trading with less') }}
            </div>
            <div>{{ $t('friction') }}</div>
          </div>

          <p class="start__text">
            {{
              $t(
                'Create an account in under a minute. Deposits, withdrawals and price alerts are included on every plan.',
              )
            }}
          </p>

          <div class="start__actions">
            <template v-if="!authStore.isAuthenticated">
              <BaseButton
                class="start__button start__button_create"
                @click="createAccount"
              >
                {{ $t('Create account') }}
              </BaseButton>

              <BaseButton
                class="start__button start__button_guest"
                variant="white-bordered"
                @click="browseSkins"
              >
                {{ $t('Browse as guest') }}
              </BaseButton>
            </template>

            <BaseButton
              v-else
              class="start__button start__button_create"
              @click="browseSkins"
            >
              {{ $t('Browse skins') }}
            </BaseButton>
          </div>
        </div>

        <div class="start__stats">
          <div v-for="stat in stats" :key="stat.label" class="start__stat">
            <div class="start__stat-value">
              {{ stat.value }}
            </div>

            <div class="start__stat-label">
              {{ stat.label }}
            </div>
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

.start {
  @include adaptiveValue('padding-top', 60, 25);
  @include adaptiveValue('padding-bottom', 160, 25);
  @media (max-width: $md4) {
    margin-left: -10px;
    margin-right: -10px;
  }
  &__card {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;

    @include adaptiveValue('gap', 48, 20);
    @include adaptiveValue('padding', 56, 15);
    @include adaptiveValue('border-radius', 38, 20);

    background-color: var(--green-kelp);
  }

  &__content {
    min-width: 0;
    max-width: 568px;
  }

  &__title {
    @include sg-42-700;

    color: var(--janna);

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 14, 9);
    }
  }

  &__text {
    max-width: 414px;

    @include sg-15-400;

    &:not(:last-child) {
      @include adaptiveValue('margin-bottom', 28, 18);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;

    @include adaptiveValue('gap', 12, 10);
  }

  &__button {
    width: auto;
    min-width: 163px;
    @include adaptiveValue('min-height', 48, 40);
    &_create {
    }

    &_guest {
    }
  }

  &__stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(120px, 1fr));

    @include adaptiveValue('gap', 14, 4);
  }

  &__stat {
    display: flex;
    flex-direction: column;
    justify-content: center;

    @include adaptiveValue('padding', 20, 15);

    @include adaptiveValue('border-radius', 28, 20);

    background-color: var(--kelp);
  }

  &__stat-value {
    @include sg-26-700;
    font-weight: 400;
    color: var(--flesh);
    &:not(:last-child) {
      margin-bottom: 3px;
    }
  }

  &__stat-label {
    @include ibm-12-400;
    color: var(--sprout);
  }
}

@media (max-width: $md2) {
  .start {
    &__card {
      grid-template-columns: 1fr;
    }

    &__content {
      max-width: 620px;
    }

    &__stats {
      width: 100%;
    }
  }
}

@media (max-width: $md3) {
  .start {
    &__stats {
      grid-template-columns: repeat(2, 1fr);
    }

    &__stat {
      min-width: 0;
    }
  }
}

@media (max-width: $md5) {
  .start {
    &__actions {
      flex-direction: column;
      align-items: stretch;
    }

    &__button {
      width: 100%;
    }

    &__stats {
      grid-template-columns: 1fr 1fr;
    }

    &__stat {
      border-radius: 20px;
    }
  }
}
</style>

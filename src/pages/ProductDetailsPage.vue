<template>
  <div class="container p-[94px_16px_170px]">
    <div class="mx-auto max-w-[1386px]">
      <!-- Back Button -->
      <div class="mb-8">
        <button
          type="button"
          @click="router.back()"
          class="group flex shrink-0 items-center gap-6 self-start transition-opacity hover:opacity-80"
        >
          <SvgIcon :icon="BackArrowIcon" class="size-12 text-primary" />
          <span class="text-[24px] font-bold uppercase text-white">{{
            $t('Back')
          }}</span>
        </button>
      </div>

      <div v-if="loading" class="flex h-96 items-center justify-center">
        <LoadingSpinner />
      </div>

      <div
        v-else-if="error"
        class="flex h-96 items-center justify-center text-error"
      >
        <p>{{ error }}</p>
      </div>

      <div v-else>
        <div class="flex flex-col gap-5 lg:gap-[20px] xl:flex-row">
          <!-- Left Side - Image and Info -->
          <div
            class="w-full flex-1 rounded-[35px] bg-[#1f1f1f] p-8 lg:p-[66px] xl:max-w-[932px]"
          >
            <div
              class="flex flex-col items-center gap-8 lg:flex-row lg:gap-[76px]"
            >
              <div class="flex-shrink-0">
                <img
                  :src="VITE_STATIC_DOMAIN + currentProduct.img_url_big"
                  :alt="currentProduct.title"
                  class="h-auto max-h-[265px] w-full max-w-[400px] object-contain"
                />
              </div>
              <div class="flex flex-col">
                <h1
                  class="text-[24px] font-bold leading-normal text-primary lg:text-[36px] 2xl:text-[47px]"
                >
                  {{ currentProduct.title }}
                </h1>
                <div class="mt-4 space-y-1">
                  <div class="flex items-center gap-4">
                    <span
                      class="w-20 flex-shrink-0 text-base leading-loose text-white/50"
                      >{{ $t('Type:') }}</span
                    >
                    <span class="text-base leading-loose text-white">{{
                      currentProduct.type
                    }}</span>
                  </div>

                  <div class="flex items-center gap-4">
                    <span
                      class="w-20 flex-shrink-0 text-base leading-loose text-white/50"
                      >{{ $t('Quality:') }}</span
                    >
                    <span class="text-base leading-loose text-white">{{
                      currentProduct.quality
                    }}</span>
                  </div>

                  <div
                    v-if="currentProduct.hero"
                    class="flex items-center gap-4"
                  >
                    <span
                      class="w-20 flex-shrink-0 text-base leading-loose text-white/50"
                      >{{ $t('Hero:') }}</span
                    >
                    <span class="text-base leading-loose text-white">{{
                      currentProduct.hero
                    }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Side - Price and Actions -->
          <div
            class="bg-size-[302px] w-full rounded-[35px] bg-[#1f1f1f] bg-center bg-no-repeat p-8 lg:p-[49px_35px_43px] xl:w-[435px]"
          >
            <div class="flex h-full flex-col items-center justify-center">
              <h3 class="mb-10 text-[25px] font-bold uppercase">
                {{ $t('Price') }}
              </h3>
              <div class="mb-12">
                <PriceFormatter
                  :price="currentProduct.price"
                  currencyClasses="size-[52px]"
                  textClasses=" text-[40px] lg:text-[64px] font-bold text-primary"
                />
              </div>
              <div class="flex w-full max-w-sm gap-5">
                <BaseButton
                  class="h-20 w-full"
                  @click="handleCartAction"
                  :disabled="loading"
                >
                  {{ $t('BUY NOW') }}
                </BaseButton>
                <BaseButton
                  class="size-20 flex-shrink-0 border-accent-orange bg-accent-orange"
                  @click="addToCart(false)"
                  :disabled="loading"
                >
                  <SvgIcon :icon="CartIcon" class="size-11 text-white" />
                </BaseButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import PriceFormatter from '@/components/PriceFormatter.vue'
import BaseButton from '@/components/base/BaseButton.vue'
import { BackArrowIcon, CartIcon } from '@/components/icons'
import SvgIcon from '@/components/icons/SvgIcon.vue'
import { GAME_CODE } from '@/composables/useProductList'
import { useToast } from '@/composables/useToast'
import { useCartStore } from '@/stores/cart'
import { useProductStore } from '@/stores/product'
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const VITE_STATIC_DOMAIN = import.meta.env.VITE_STATIC_DOMAIN

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const cartStore = useCartStore()
const toast = useToast()
const { t } = useI18n()

const loading = ref(true)
const error = ref(null)

const currentProduct = computed(() => productStore.currentProduct)
const carouselItems = ref([])

const fetchProductData = async () => {
  try {
    loading.value = true
    const productId = route.params.productId
    if (!productId) throw new Error('Product ID is missing')

    await productStore.fetchProductDetails(productId)

    if (
      currentProduct.value?.similar &&
      currentProduct.value.similar.length > 0
    ) {
      carouselItems.value = currentProduct.value.similar
    } else {
      await fetchProductsByCategory(currentProduct.value.category)
    }
  } catch (err) {
    error.value = err.message || t('Unable to load product details')
  } finally {
    loading.value = false
  }
}

const handleCartAction = async () => {
  await addToCart(true)
}

const addToCart = async (navigate = false) => {
  try {
    const id = currentProduct.value.id
    const { success, message, isUnauthorized } = await cartStore.addToCart(
      id,
      1,
    )

    if (!success) {
      if (isUnauthorized) {
        toast.warning(t('Please login to add items to cart'))
        router.push({
          name: 'LoginPage',
          query: {
            redirect: router.currentRoute.value.fullPath || '/',
          },
        })
        return
      }
      toast.error(message || t('Failed to add item to cart'))
    } else {
      toast.success(t('Item added to cart!'))
      if (navigate) {
        router.push({ name: 'CartPage' })
      }
    }
  } catch (err) {
    toast.error(t('Failed to add item to cart'))
    console.error('Add to cart error:', err)
  }
}

const fetchProductsByCategory = async category => {
  try {
    const safeCategory = category || GAME_CODE
    const params = {
      category: safeCategory,
      random: true,
      limit: 20,
    }
    await productStore.fetchRandomProducts(params)
    carouselItems.value = productStore.randomProducts
  } catch (error) {
    console.error('Error fetching products by category:', error)
    carouselItems.value = []
  }
}

watch(() => route.params.productId, fetchProductData)
onMounted(fetchProductData)
</script>

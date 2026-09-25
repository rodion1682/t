import { createRouter, createWebHashHistory } from 'vue-router'

import AccountPage from '@/pages/AccountPage/AccountPage.vue'
import ForgotPasswordPage from '@/pages/Auth/ForgotPasswordPage.vue'
import LoginPage from '@/pages/Auth/LoginPage.vue'
import RegisterPage from '@/pages/Auth/RegisterPage.vue'
import CartPage from '@/pages/CartPage/CartPage.vue'
import ContactPage from '@/pages/ContactPage/ContactPage.vue'
import EmailVerificationAlreadySuccessPage from '@/pages/Email/EmailVerificationAlreadySuccessPage.vue'
import EmailVerificationPage from '@/pages/Email/EmailVerificationPage.vue'
import EmailVerificationSuccessPage from '@/pages/Email/EmailVerificationSuccessPage.vue'
import FaqPage from '@/pages/FaqPage/FaqPage.vue'
import HomePage from '@/pages/HomePage/HomePage.vue'
import DetailedProduct from '@/pages/ProductsPage/DetailedProduct.vue'
import ProductListPage from '@/pages/ProductsPage/ProductListPage.vue'
import SellSkisnPage from '@/pages/SellSkin/SellSkisnPage.vue'
import StaticPage from '@/pages/StaticPage.vue'
import FailPaymentPage from '@/pages/StatusPages/FailPaymentPage.vue'
import PendingPaymentPage from '@/pages/StatusPages/PendingPaymentPage.vue'
import SuccessPaymentPage from '@/pages/StatusPages/SuccessPaymentPage.vue'

import { useAuthStore } from '@/stores/auth'

let authVerificationPromise = null

const verifyAuth = () => {
  const authStore = useAuthStore()

  if (authVerificationPromise) {
    return authVerificationPromise
  }

  authVerificationPromise = authStore.checkAuth().catch(error => {
    console.error('Auth verification failed:', error)

    authVerificationPromise = null

    return false
  })

  return authVerificationPromise
}

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'HomePage',
      component: HomePage,
    },

    {
      path: '/sell-skins',
      name: 'SellSkisnPage',
      component: SellSkisnPage,
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/login',
      name: 'LoginPage',
      component: LoginPage,
      meta: {
        guestOnly: true,
      },
    },

    {
      path: '/register',
      name: 'RegisterPage',
      component: RegisterPage,
      meta: {
        guestOnly: true,
      },
    },

    {
      path: '/forgot-password',
      name: 'ForgotPasswordPage',
      component: ForgotPasswordPage,
      meta: {
        guestOnly: true,
      },
    },

    {
      path: '/success-payment',
      name: 'SuccessPaymentPage',
      component: SuccessPaymentPage,
    },

    {
      path: '/fail-payment',
      name: 'FailPaymentPage',
      component: FailPaymentPage,
    },

    {
      path: '/pending-payment',
      name: 'PendingPaymentPage',
      component: PendingPaymentPage,
    },

    {
      path: '/processing-payment',
      name: 'ProcessingPaymentPage',
      component: PendingPaymentPage,
    },

    {
      path: '/contact',
      name: 'ContactPage',
      component: ContactPage,
    },

    {
      path: '/sale',
      name: 'SalePage',
      component: ProductListPage,
      props: {
        isSalePage: true,
      },
    },

    {
      path: '/new',
      name: 'NewItemsPage',
      component: ProductListPage,
      props: {
        isNewItemsPage: true,
      },
    },

    {
      path: '/products',
      name: 'ProductListPage',
      component: ProductListPage,
    },

    {
      path: '/products/p/:productId',
      name: 'ProductDetailsPage',
      component: DetailedProduct,
      props: route => ({
        productId: route.params.productId,
      }),
    },

    {
      path: '/account',
      name: 'account',
      component: AccountPage,
      meta: {
        requiresAuth: true,
      },
      redirect: {
        name: 'account-profile',
      },
      children: [
        {
          path: 'profile',
          name: 'account-profile',
          component: AccountPage,
        },

        {
          path: 'change-password',
          name: 'change-password',
          component: AccountPage,
        },

        {
          path: 'balance',
          name: 'account-balance',
          component: AccountPage,
        },

        {
          path: 'offers',
          name: 'account-offers',
          component: AccountPage,
        },

        {
          path: 'payment-history',
          name: 'account-payment-history',
          component: AccountPage,
        },

        {
          path: 'order-history',
          name: 'account-order-history',
          component: AccountPage,
        },
      ],
    },

    {
      path: '/faq',
      name: 'FAQ',
      component: FaqPage,
      meta: {
        title: 'Frequently Asked Questions',
      },
    },

    {
      path: '/email-verification',
      name: 'EmailVerificationPage',
      component: EmailVerificationPage,
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/email/verify/success',
      name: 'EmailVerificationSuccessPage',
      component: EmailVerificationSuccessPage,
    },

    {
      path: '/email/verify/already-success',
      name: 'EmailVerificationAlreadySuccessPage',
      component: EmailVerificationAlreadySuccessPage,
    },

    {
      path: '/cart',
      name: 'CartPage',
      component: CartPage,
      meta: {
        requiresAuth: true,
      },
    },

    {
      path: '/page/:id',
      name: 'StaticPage',
      component: StaticPage,
      props: true,
    },

    {
      path: '/:slug',
      name: 'StaticPageBySlug',
      component: StaticPage,
      props: true,
    },

    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      const scrollToHash = () => ({
        el: to.hash,
        top: 50,
        behavior: 'smooth',
      })

      if (to.path !== from.path) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve(scrollToHash())
          }, 350)
        })
      }

      return scrollToHash()
    }

    if (to.path === from.path) {
      const pageChanged = to.query.page !== from.query.page

      if (pageChanged) {
        return {
          top: 0,
        }
      }

      return false
    }

    return {
      top: 0,
    }
  },
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)

  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  if (from.name === null) {
    await verifyAuth()
  }

  const isAuthenticated = authStore.isAuthenticated

  if (requiresAuth && !isAuthenticated) {
    next({
      name: 'LoginPage',
      query: {
        redirect: to.fullPath,
      },
    })

    return
  }

  if (guestOnly && isAuthenticated) {
    next({
      name: 'HomePage',
    })

    return
  }

  next()
})

export default router

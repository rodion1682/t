import AccountPage from '@/pages/AccountPage/AccountPage.vue'
import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage/HomePage.vue'
// import ProductDetailsPage from '@/pages/ProductDetailsPage.vue'
import FaqPage from '@/pages/FaqPage/FaqPage.vue'
import StaticPage from '@/pages/StaticPage.vue'
// import ContactPage from '@/pages/ContactPage.vue'
import ForgotPasswordPage from '@/pages/Auth/ForgotPasswordPage.vue'
import LoginPage from '@/pages/Auth/LoginPage.vue'
import RegisterPage from '@/pages/Auth/RegisterPage.vue'

import CartPage from '@/pages/CartPage/CartPage.vue'
import ContactPage from '@/pages/ContactPage/ContactPage.vue'
import EmailVerificationAlreadySuccessPage from '@/pages/Email/EmailVerificationAlreadySuccessPage.vue'
import EmailVerificationPage from '@/pages/Email/EmailVerificationPage.vue'
import EmailVerificationSuccessPage from '@/pages/Email/EmailVerificationSuccessPage.vue'
import DetailedProduct from '@/pages/ProductsPage/DetailedProduct.vue'
import ProductListPage from '@/pages/ProductsPage/ProductListPage.vue'
import SellSkisnPage from '@/pages/SellSkin/SellSkisnPage.vue'
import PendingPaymentPage from '@/pages/StatusPages/PendingPaymentPage.vue'
import SuccessPaymentPage from '@/pages/StatusPages/SuccessPaymentPage.vue'
import FailPaymentPage from '@/pages/StatusPages/FailPaymentPage.vue'

// Global auth verification state
let authVerificationPromise = null

// Function to ensure auth verification happens only once per app lifecycle
const verifyAuth = () => {
  const authStore = useAuthStore()

  // If verification is already in progress, return the existing promise
  if (authVerificationPromise) {
    return authVerificationPromise
  }

  // Start verification and store the promise
  authVerificationPromise = authStore.checkAuth().catch(error => {
    console.error('Auth verification failed:', error)
    // Reset the promise on error so we can retry
    authVerificationPromise = null
    // Return false to indicate auth failed
    return false
  })

  return authVerificationPromise
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
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
    //{
    //  path: '/reset-password',
    //  name: 'ResetPasswordPage',
    //  component: () => import('@/pages/ResetPasswordFormPage.vue'),
    //  meta: { guestOnly: true },
    //},
    // {
    //   path: '/topup',
    //   name: 'TopUp',
    //   component: () => import('@/pages/TopUpPage.vue'),
    //   meta: {
    //     requiresAuth: true,
    //   },
    // },
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
      props: { isSalePage: true },
    },
    {
      path: '/new',
      name: 'NewItemsPage',
      component: ProductListPage,
      props: { isNewItemsPage: true },
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
    //{
    //  path: '/cs2',
    //  name: 'ProductListCs2',
    //  component: ProductListPage,
    //  props: { game: 'cs2' },
    //},
    //{
    //  path: '/cs2/p/:productId',
    //  name: 'ProductDetailsCs2',
    //  component: ProductListPage,
    //  props: route => ({ game: 'cs2', productId: route.params.productId }),
    //},
    //{
    //  path: '/dota2',
    //  name: 'ProductListDota2',
    //  component: ProductListPage,
    //  props: { game: 'dota2' },
    //},
    //{
    //  path: '/dota2/p/:productId',
    //  name: 'ProductDetailsDota2',
    //  component: ProductListPage,
    //  props: route => ({ game: 'dota2', productId: route.params.productId }),
    //},

    //{
    //  path: '/products/:category/:subcategory?',
    //  name: 'ProductListPageWithCategory',
    //  component: ProductListPage,
    //},
    //{
    //  path: '/products/:category/:subcategory?/p/:productId',
    //  name: 'ProductDetailsWithCategory',
    //  component: ProductListPage,
    //  props: route => ({ productId: route.params.productId }),
    //},
    //{
    //  path: '/products/:category/:subcategory/:productId',
    //  name: 'ProductDetailsPage',
    //  component: ProductDetailsPage,
    //},
    {
      path: '/account',
      name: 'account',
      component: AccountPage,
      meta: {
        requiresAuth: true,
      },
      redirect: '/account/profile',
      children: [
        {
          path: 'profile',
          name: 'account-profile',
          component: AccountPage,
        },
        //{
        //  path: 'security',
        //  name: 'account-security',
        //  component: AccountPage,
        //},
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
        //{
        //  path: 'deposits',
        //  name: 'account-deposits',
        //  component: AccountPage,
        //},
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
      meta: { requiresAuth: true },
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
    // Keep legacy ID-based route for backward compatibility
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('@/pages/NotFoundPage.vue'),
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // If returning to a saved position (e.g., using browser back/forward)
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      // If navigating from a different path, wait for component to mount
      if (to.path !== from.path) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              el: to.hash,
              behavior: 'smooth',
            })
          }, 350)
        })
      }
      return {
        el: to.hash,
        behavior: 'smooth',
      }
    }

    // If only filter parameters changed but the route path remained the same,
    // prevent auto-scrolling except for page number changes
    if (to.path === from.path) {
      // Check if only the 'page' parameter changed
      const pageChanged = to.query.page !== from.query.page

      // Only scroll to top if the page parameter changed
      if (pageChanged) {
        return { top: 0 }
      } else {
        // Maintain current scroll position for other parameter changes
        return false
      }
    }

    // Default behavior for other navigation: scroll to top
    return { top: 0 }
  },
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const guestOnly = to.matched.some(record => record.meta.guestOnly)

  // Always verify auth with server on direct navigation (page refresh or typing URL)
  // This ensures we're synchronized with server state
  if (from.name === null) {
    await verifyAuth()
  }

  // Get the latest auth state after verification
  const isAuthenticated = authStore.isAuthenticated

  // Apply routing rules based on verified auth state
  if (requiresAuth && !isAuthenticated) {
    next({ name: 'LoginPage', query: { redirect: to.fullPath } })
  } else if (guestOnly && isAuthenticated) {
    next({ name: 'HomePage' })
  } else {
    next()
  }
})

export default router

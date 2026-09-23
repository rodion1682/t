productListInstance.js
// src/composables/productListInstance.js

import { useProductList } from '@/composables/useProductList'

let productListInstance = null

export const useProductListInstance = () => {
  if (!productListInstance) {
    productListInstance = useProductList()
  }

  return productListInstance
}

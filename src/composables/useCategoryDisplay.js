// src/composables/useCategoryDisplay.js
import { computed } from 'vue'

const capitalizeFirstLetter = string => {
  if (!string) return ''
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export function useCategoryDisplay(product, categoriesRef) {
  // Helper to find complete category path for a subcategory
  const findFullCategoryPath = (categories, targetName) => {
    const search = (cats, accumPath = []) => {
      for (const cat of cats) {
        const currentPath = [...accumPath, cat]

        // Check if current category matches
        if (cat.name.toLowerCase() === targetName.toLowerCase()) {
          return currentPath
        }

        // Search in subcategories
        if (cat.subcategories?.length) {
          const foundInSub = search(cat.subcategories, currentPath)
          if (foundInSub) return foundInSub
        }
      }
      return null
    }

    return search(categories)
  }

  const categoryPath = computed(() => {
    if (!product.value?.categories?.[0]?.name || !categoriesRef?.value)
      return null
    return findFullCategoryPath(
      categoriesRef.value,
      product.value.categories[0].name,
    )
  })

  const displayCategory = computed(() => {
    if (!product.value?.categories?.[0]?.name) return 'All'
    return product.value.categories[0].name
  })

  const parentCategory = computed(() => {
    if (!categoriesRef?.value || !product.value?.categories?.[0]?.name)
      return 'all'

    const path = categoryPath.value
    if (path?.length > 1) {
      return path[0].name
    }

    if (path?.length === 1) {
      return path[0].name
    }

    return 'all'
  })

  return {
    displayCategory,
    parentCategory,
    categoryPath,
    categoryInfo: computed(
      () => categoryPath.value?.[categoryPath.value.length - 1] || null,
    ),
    capitalizeFirstLetter,
  }
}

// Also export the function directly for use without the composable
export { capitalizeFirstLetter }

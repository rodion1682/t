import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import axios from '@/plugins/axios'

export function useCategories() {
  const categories = ref([])
  const loading = ref(false)
  const error = ref(null)
  const route = useRoute()

  const fetchCategories = async () => {
    if (loading.value || categories.value.length > 0) return

    loading.value = true
    error.value = null

    try {
      const { data } = await axios.get('/categories')
      if (data.status === 'OK') {
        categories.value = data.payload
      } else {
        throw new Error(data.message || 'Failed to fetch categories')
      }
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load categories'
      console.error('Error fetching categories:', error.value)
    } finally {
      loading.value = false
    }
  }

  // Helper function to recursively find a category by URL or name
  const findCategory = (categories, url, name) => {
    for (const category of categories) {
      if (
        category.url === url ||
        (name && category.name.toLowerCase() === name.toLowerCase())
      ) {
        return category
      }
      if (category.subcategories) {
        const found = findCategory(category.subcategories, url, name)
        if (found) return found
      }
    }
    return null
  }

  const findCategoryByUrl = url => {
    return findCategory(categories.value, url, null)
  }

  const findCategoryByName = name => {
    return findCategory(categories.value, null, name)
  }

  const getCategoryIds = () => {
    const { category: categoryParam, subcategory: subcategoryParam } =
      route.params

    if (categoryParam && categoryParam !== 'all') {
      const category = findCategoryByUrl(categoryParam)
      if (category) {
        if (subcategoryParam && subcategoryParam !== 'all') {
          const subcategory = findCategoryByUrl(subcategoryParam)
          if (subcategory) {
            return { categoryId: category.id, subcategoryId: subcategory.id }
          }
        }
        return { categoryId: category.id, subcategoryId: null }
      }
    }

    if (categoryParam && categoryParam !== 'all') {
      const category = findCategoryByName(categoryParam)
      if (category) {
        if (subcategoryParam && subcategoryParam !== 'all') {
          const subcategory = findCategoryByName(subcategoryParam)
          if (subcategory) {
            return { categoryId: category.id, subcategoryId: subcategory.id }
          }
        }
        return { categoryId: category.id, subcategoryId: null }
      }
    }

    return { categoryId: null, subcategoryId: null }
  }

  const getCategoryPath = (categoryUrl, subcategoryUrl) => {
    const path = []
    let currentCategory = null

    // 1. Find the starting category (subcategory or category)
    if (subcategoryUrl && subcategoryUrl !== 'all') {
      currentCategory = findCategoryByUrl(subcategoryUrl)
      if (!currentCategory) {
        currentCategory = findCategoryByName(subcategoryUrl)
      }
    }
    if (!currentCategory && categoryUrl && categoryUrl !== 'all') {
      currentCategory = findCategoryByUrl(categoryUrl)
      if (!currentCategory) {
        currentCategory = findCategoryByName(categoryUrl)
      }
    }

    // 2. Traverse up the hierarchy using subcategories
    if (currentCategory) {
      path.unshift({
        name: currentCategory.name,
        url: currentCategory.url,
      })

      // Function to find the parent of a category
      const findParent = (categories, category) => {
        for (const parent of categories) {
          if (
            parent.subcategories &&
            parent.subcategories.some(c => c.id === category.id)
          ) {
            return parent
          }
          if (parent.subcategories) {
            const foundParent = findParent(parent.subcategories, category)
            if (foundParent) return foundParent
          }
        }
        return null
      }

      // Iterate up the hierarchy to find all parents
      let parentCategory = findParent(categories.value, currentCategory)
      while (parentCategory) {
        path.unshift({
          name: parentCategory.name,
          url: parentCategory.url,
        })
        parentCategory = findParent(categories.value, parentCategory)
      }
    }

    return path
  }

  const categoryIds = computed(() => getCategoryIds())

  return {
    categories,
    loading,
    error,
    fetchCategories,
    categoryIds,
    getCategoryPath,
    findCategoryByUrl,
    findCategoryByName,
  }
}

import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const GAME_STORAGE_KEY = 'selected-game'
const DEFAULT_GAME = 'cs2'
const ALLOWED_GAMES = ['cs2', 'dota2'] // 'cs2', 'dota2'

const selectedGame = ref(localStorage.getItem(GAME_STORAGE_KEY) || DEFAULT_GAME)

export function useGame() {
  const route = useRoute()
  const router = useRouter()

  const getValidGame = game => {
    const normalized = String(game || '').toLowerCase()

    return ALLOWED_GAMES.includes(normalized) ? normalized : DEFAULT_GAME
  }

  const marketRoute = computed(() => ({
    name: 'ProductListPage',
    query: {
      category: selectedGame.value,
    },
  }))

  const isMarketRoute = computed(() => route.name === 'ProductListPage')

  const clearGameFilters = () => ({
    page: undefined,
    type: undefined,
    heroes: undefined,
    subcategories: undefined,
    quality: undefined,
    exterior_names: undefined,
    item_class: undefined,
    price_from: undefined,
    price_to: undefined,
    sort: undefined,
    search: undefined,
  })

  const setGame = game => {
    const newGame = getValidGame(game)

    if (selectedGame.value === newGame) {
      return
    }

    selectedGame.value = newGame
    localStorage.setItem(GAME_STORAGE_KEY, newGame)

    if (!isMarketRoute.value) {
      return
    }

    router.push({
      name: 'ProductListPage',
      query: {
        ...route.query,
        ...clearGameFilters(),
        category: newGame,
      },
    })
  }

  const syncGame = game => {
    if (!game) return

    const newGame = getValidGame(game)

    selectedGame.value = newGame
    localStorage.setItem(GAME_STORAGE_KEY, newGame)
  }

  return {
    selectedGame,
    marketRoute,
    setGame,
    syncGame,
  }
}

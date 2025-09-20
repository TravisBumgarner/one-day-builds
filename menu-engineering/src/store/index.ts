// store.ts
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export type Ingredient = {
  id: string
  name: string
  unit: string
  quantity: number
}

export type Recipe = {
  id: string
  title: string
  yield: number
  unit: string
  ingredients: Ingredient[]
}

type State = {
  isLoading: boolean
  recipes: Recipe[]
  ingredients: Ingredient[]

  setLoadingUser: (isLoading: boolean) => void
  saveRecipe: (recipe: Recipe) => void
}

const useGlobalStore = create<State>()(
  devtools(
    set => ({
      isLoading: true,
      recipes: [],
      ingredients: [],

      setLoadingUser: (isLoading: boolean) => set({ isLoading }),

      saveRecipe: recipe =>
        set(state => ({
          recipes: [...state.recipes, recipe],
          ingredients: [...state.ingredients, ...recipe.ingredients.filter(ing => ing.name.trim() !== '')]
        }))
    }),
    { name: 'store' }
  )
)

export default useGlobalStore

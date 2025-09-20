export type Ingredient = {
  id: string
  name: string
  quantity: number
  unit: string
}

export type Recipe = {
  id: string
  title: string
  description: string
  ingredients: (Ingredient | Recipe)[]
}

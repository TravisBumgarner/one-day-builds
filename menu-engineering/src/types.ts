type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
};

type Recipe = {
  id: string;
  title: string;
  description: string;
  ingredients: (Ingredient | Recipe)[];
};

const recipe: Recipe = {
  id: "1",
  title: "Pancakes",
  description: "Fluffy pancakes",
  ingredients: [
    {
      id: "2",
      title: "Syrup",
      description: "Sweet syrup",
      ingredients: [
        { id: "3", name: "Sugar", quantity: 100, unit: "g" },
        { id: "4", name: "Water", quantity: 200, unit: "ml" },
      ],
    },
    { id: "5", name: "Flour", quantity: 200, unit: "g" },
    { id: "6", name: "Eggs", quantity: 2, unit: "pcs" },
  ],
};

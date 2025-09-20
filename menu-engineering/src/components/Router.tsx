import { Route, Routes } from 'react-router-dom'
import { ROUTES } from '../consts'
import Home from '../pages/Home'
import RecipeBuilder from '../pages/RecipeBuilder'
import Recipes from '../pages/Recipes'
import Reference from '../pages/Reference'

const Router = () => (
  <Routes>
    <Route path={ROUTES.reference.href} element={<Reference />} />
    <Route path={ROUTES.home.href} element={<Home />} />
    <Route path={ROUTES.recipeBuilder.href} element={<RecipeBuilder />} />
    <Route path={ROUTES.recipes.href} element={<Recipes />} />
  </Routes>
)

export default Router

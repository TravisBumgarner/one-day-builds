import { Route, Routes } from 'react-router-dom'
import { ROUTES } from '../consts'
import Home from '../pages/Home'
import Reference from '../pages/Reference'

const Router = () => (
  <Routes>
    <Route path={ROUTES.reference.href} element={<Reference />} />
    <Route path={ROUTES.home.href} element={<Home />} />
  </Routes>
)

export default Router

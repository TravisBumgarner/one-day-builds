import { Box } from '@mui/material'
import { BrowserRouter } from 'react-router-dom'
import Navigation from './components/Navigation'
import Router from './components/Router'

function App() {
  return (
    <BrowserRouter>
      <Box>
        <Navigation />
        <Router />
      </Box>
    </BrowserRouter>
  )
}

export default App

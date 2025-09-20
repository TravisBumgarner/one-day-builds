import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography
} from '@mui/material'
import { FiChevronDown } from 'react-icons/fi' // 👈 react-icons instead of MUI icon
import useGlobalStore from '../store'

export default function Recipes() {
  const recipes = useGlobalStore(s => s.recipes)

  if (recipes.length === 0) {
    return (
      <Box p={2}>
        <Typography variant="h6">No recipes saved yet.</Typography>
      </Box>
    )
  }

  return (
    <Box p={2} display="flex" flexDirection="column" gap={2}>
      {recipes.map(recipe => (
        <Paper key={recipe.id} elevation={2}>
          <Accordion>
            <AccordionSummary expandIcon={<FiChevronDown />}>
              <Box display="flex" flexDirection="column" sx={{ flexGrow: 1, textAlign: 'left' }}>
                <Typography variant="h6">{recipe.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Makes {recipe.yield} {recipe.unit}
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {recipe.ingredients.map(ing => (
                  <ListItem key={ing.id} sx={{ pl: 2 }}>
                    <ListItemText primary={`${ing.name} – ${ing.quantity} ${ing.unit}`} />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Paper>
      ))}
    </Box>
  )
}

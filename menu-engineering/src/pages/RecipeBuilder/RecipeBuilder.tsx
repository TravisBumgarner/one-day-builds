import {
  Autocomplete,
  Box,
  Button,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField
} from '@mui/material'
import React, { useState } from 'react'
import { FiTrash2 } from 'react-icons/fi'
import { v4 as uuidv4 } from 'uuid'
import useGlobalStore, { type Ingredient, type Recipe } from '../../store'

type Item = {
  id: string
  name: string
  unit: string
  quantity: number
  children?: Item[]
}

const availableIngredients = ['Chicken', 'Cheese', 'Basil', 'Flour', 'Salt', 'Tomato Sauce', 'Dough']

const unitOptions = ['Cup', 'Tablespoon', 'Teaspoon', 'Unit']

export default function RecipeTable() {
  const saveRecipe = useGlobalStore(s => s.saveRecipe)

  const [title, setTitle] = useState<string>('')
  const [items, setItems] = useState<Item[]>([])
  const [recipeYield, setRecipeYield] = useState<number>(1)
  const [recipeUnit, setRecipeUnit] = useState<string>('Cup')

  const addItem = (parentId?: string) => {
    const newItem: Item = {
      id: uuidv4(),
      name: '',
      unit: '',
      quantity: 0
    }

    if (!parentId) {
      setItems([...items, newItem])
    } else {
      const updateTree = (list: Item[]): Item[] =>
        list.map(item =>
          item.id === parentId
            ? { ...item, children: [...(item.children || []), newItem] }
            : {
                ...item,
                children: item.children ? updateTree(item.children) : item.children
              }
        )
      setItems(updateTree(items))
    }
  }

  const deleteItem = (id: string, parentId?: string) => {
    if (!parentId) {
      setItems(items.filter(i => i.id !== id))
    } else {
      const updateTree = (list: Item[]): Item[] =>
        list.map(item =>
          item.id === parentId
            ? { ...item, children: item.children?.filter(c => c.id !== id) }
            : {
                ...item,
                children: item.children ? updateTree(item.children) : item.children
              }
        )
      setItems(updateTree(items))
    }
  }

  const updateItemField = (id: string, field: keyof Item, value: any, parentId?: string) => {
    const updateTree = (list: Item[]): Item[] =>
      list.map(item => {
        if (item.id === id) {
          return { ...item, [field]: value }
        }
        return {
          ...item,
          children: item.children ? updateTree(item.children) : item.children
        }
      })
    setItems(updateTree(items))
  }

  const flattenItems = (list: Item[]): Ingredient[] => {
    return list.flatMap(item => [
      { id: item.id, name: item.name, unit: item.unit, quantity: item.quantity },
      ...(item.children ? flattenItems(item.children) : [])
    ])
  }

  const handleSave = () => {
    const recipe: Recipe = {
      id: uuidv4(),
      title,
      yield: recipeYield,
      unit: recipeUnit,
      ingredients: flattenItems(items)
    }
    saveRecipe(recipe)

    // clear after save
    setTitle('')
    setItems([])
    setRecipeYield(1)
    setRecipeUnit('Cup')
  }

  const renderRows = (list: Item[], depth = 0, parentId?: string) =>
    list.map(item => (
      <React.Fragment key={item.id}>
        <TableRow>
          <TableCell sx={{ paddingLeft: depth * 2 }}>
            <Autocomplete
              freeSolo
              options={availableIngredients}
              value={item.name}
              onChange={(_, newValue) => updateItemField(item.id, 'name', newValue, parentId)}
              onInputChange={(_, newValue) => updateItemField(item.id, 'name', newValue, parentId)}
              renderInput={params => <TextField {...params} placeholder="Item name" size="small" fullWidth />}
            />
          </TableCell>

          <TableCell sx={{ width: '15%' }}>
            <TextField
              fullWidth
              select
              value={item.unit}
              onChange={e => updateItemField(item.id, 'unit', e.target.value, parentId)}
              size="small"
            >
              {unitOptions.map(u => (
                <MenuItem key={u} value={u}>
                  {u}
                </MenuItem>
              ))}
            </TextField>
          </TableCell>

          <TableCell sx={{ width: '10%' }}>
            <TextField
              fullWidth
              type="number"
              value={item.quantity}
              onChange={e => updateItemField(item.id, 'quantity', parseFloat(e.target.value) || 0, parentId)}
              size="small"
            />
          </TableCell>

          <TableCell sx={{ width: '20%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
              {!item.children ? (
                <Button size="small" onClick={() => addItem(item.id)}>
                  Convert to recipe
                </Button>
              ) : (
                <Button size="small" onClick={() => addItem(item.id)}>
                  + Add Sub-Item
                </Button>
              )}
              <IconButton onClick={() => deleteItem(item.id, parentId)}>
                <FiTrash2 />
              </IconButton>
            </Box>
          </TableCell>
        </TableRow>

        {item.children && renderRows(item.children, depth + 1, item.id)}
      </React.Fragment>
    ))

  return (
    <Box>
      <Box display="flex" gap={2} p={2} alignItems="center">
        <TextField
          label="Recipe Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          size="small"
          sx={{ flex: 1 }}
        />
        <span>Recipe makes</span>
        <TextField
          type="number"
          value={recipeYield}
          onChange={e => setRecipeYield(parseFloat(e.target.value) || 0)}
          size="small"
          sx={{ width: 80 }}
        />
        <TextField select value={recipeUnit} onChange={e => setRecipeUnit(e.target.value)} size="small">
          {unitOptions.map(u => (
            <MenuItem key={u} value={u}>
              {u}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ flex: '30%' }}>Item</TableCell>
              <TableCell sx={{ width: '15%' }}>Units</TableCell>
              <TableCell sx={{ width: '15%' }}>Quantity</TableCell>
              <TableCell sx={{ width: '30%' }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {renderRows(items)}
            <TableRow>
              <TableCell colSpan={4}>
                <Button fullWidth variant="outlined" onClick={() => addItem()}>
                  + Add Item
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box p={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" color="primary" onClick={handleSave}>
          Save Recipe
        </Button>
      </Box>
    </Box>
  )
}

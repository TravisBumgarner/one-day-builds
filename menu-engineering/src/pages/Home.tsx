import { Autocomplete, Box, TextField } from '@mui/material'

const options = [
  { label: 'The Godfather', id: 1 },
  { label: 'Pulp Fiction', id: 2 }
]

const Home = () => {
  return (
    <Box>
      <h2>Search</h2>
      <Autocomplete
        disablePortal
        options={options}
        sx={{ width: 300 }}
        renderInput={params => <TextField {...params} label="Search" />}
      />
    </Box>
  )
}

export default Home

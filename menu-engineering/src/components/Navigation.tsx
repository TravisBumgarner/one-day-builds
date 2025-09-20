import { GiHamburgerMenu } from 'react-icons/gi'

import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'

import Divider from '@mui/material/Divider'
import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../consts'
import { BORDER_RADIUS, FONT_SIZES, SPACING } from '../styles/consts'

type Items = (keyof typeof ROUTES | 'divider')[]

const DropdownLinks = ({ onClose }: { onClose: () => void }) => {
  const USER_ROUTES: Items = ['home', 'reference']

  return (
    <>
      {USER_ROUTES.map((key, index) =>
        key === 'divider' ? (
          <Divider key={key + index} />
        ) : (
          <Link key={key} to={ROUTES[key].href}>
            <MenuItem onClick={onClose}>{ROUTES[key].label}</MenuItem>
          </Link>
        )
      )}
    </>
  )
}

const Navigation = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }, [])

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: SPACING.LARGE.PX }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: '14px'
        }}
      >
        <Typography variant="h1" sx={{ fontSize: FONT_SIZES.LARGE.PX }}>
          <Link to={ROUTES.home.href}>Menu Engineering</Link>
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          gap: SPACING.MEDIUM.PX,
          alignItems: 'center'
        }}
      >
        <Tooltip title="Menu">
          <IconButton
            aria-label="menu"
            aria-controls={open ? 'navigation-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={handleClick}
          >
            <GiHamburgerMenu />
          </IconButton>
        </Tooltip>
        <Menu
          slotProps={{ paper: { sx: { borderRadius: BORDER_RADIUS.ZERO.PX } } }}
          id="navigation-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
        >
          <DropdownLinks onClose={handleClose} />
        </Menu>
      </Box>
    </Box>
  )
}

export default Navigation

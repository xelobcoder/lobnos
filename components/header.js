import { AppBar, Toolbar, Box, Typography, Button } from '@mui/material';
import Link from 'next/link';

function Header() {
  return (
    <Box>
      <AppBar position="sticky" sx={{backgroundColor:'#00224f'}}>
        <Toolbar>
          <Typography variant="h4" color="inherit" component={'div'}>
            diagnostico
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default Header

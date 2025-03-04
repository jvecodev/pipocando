import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Box, 
  Button, 
  Container 
} from '@mui/material';
import { Movie as MovieIcon } from '@mui/icons-material';

const Header: React.FC = () => {
  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <MovieIcon sx={{ mr: 1 }} />
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{ fontWeight: 700 }}
            >
              Pipocando
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            {['Início', 'Filmes', 'Categorias', 'Sobre'].map((page) => (
              <Button
                key={page}
                sx={{ 
                  color: 'white', 
                  display: 'block', 
                  mx: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }
                }}
              >
                {page}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
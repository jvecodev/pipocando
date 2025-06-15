import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import { useNavigate } from 'react-router-dom';
import Content from './Content';
import MainLayout from '../../layout/MainLayout';

export default function Blog(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();

  return (
    <MainLayout disableCustomTheme={props.disableCustomTheme}>
      <Box
        sx={{
          width: '100%',
          height: '400px',
          position: 'relative',
          overflow: 'hidden',
          margin: '-2rem -24px 0',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          boxShadow: 3,
          borderRadius: '16px',
          mb: 6,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }
        }}
      >
      
        <Container maxWidth="lg" sx={{ height: '100%', position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
              px: { xs: 2, md: 0 },
            }}
          >
            <Typography
              variant="h1"
              sx={{
                color: 'white',
                fontWeight: 'bold',
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Blog Pipocando
            </Typography>
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                maxWidth: '800px',
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                mb: 3,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Notícias, resenhas e curiosidades sobre o mundo do cinema e séries.
              Descubra os lançamentos, críticas especializadas e listas temáticas.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/movies')}
                startIcon={<MovieIcon />}
              >
                Explorar Filmes
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                  }
                }}
                onClick={() => navigate('/series')}
                startIcon={<TvIcon />}
              >
                Explorar Séries
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
      
      <Content />
    </MainLayout>
  );
}
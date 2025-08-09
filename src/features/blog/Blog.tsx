import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import MovieIcon from '@mui/icons-material/Movie';
import TvIcon from '@mui/icons-material/Tv';
import { useNavigate } from 'react-router-dom';
import { alpha } from '@mui/material/styles';
import Content from './Content';
import MainLayout from '../../layout/MainLayout';

export default function Blog(props: { disableCustomTheme?: boolean }) {
  const navigate = useNavigate();

  return (
    <MainLayout disableCustomTheme={props.disableCustomTheme}>
      <Box
        sx={(theme) => ({
          width: '100%',
          height: '400px',
          position: 'relative',
          overflow: 'hidden',
          margin: '-1rem -24px 0',
          mb: 6,
        })}
      >
        <Container
          maxWidth="lg"
          sx={{ height: '100%', position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', minHeight: 400 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              height: '100%',
              px: { xs: 2, md: 0 },
            }}
          >
            <Box sx={{ textAlign: 'left', mb: 6, mt: { xs: 6, md: 12 } }}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 'bold',
                  fontSize: { xs: '2.5rem', md: '4rem' },
                  color: 'text.primary',
                }}
              >
                Blog
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ fontWeight: 500, maxWidth: 800, mb: 4 }}
              >
                Notícias, resenhas e curiosidades sobre o mundo do cinema e séries. Descubra os lançamentos, críticas especializadas e listas temáticas.
              </Typography>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
                <Button
                  variant="contained"
                  color="inherit"
                  size="large"
                  startIcon={<MovieIcon />}
                  onClick={() => navigate('/filmes')}
                  sx={{ fontWeight: 500, borderRadius: 2, px: 4 }}
                >
                  Explorar Filmes
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  startIcon={<TvIcon />}
                  onClick={() => navigate('/series')}
                  sx={{ fontWeight: 500, borderRadius: 2, px: 4, borderColor: 'rgba(255,255,255,0.2)' }}
                >
                  Explorar Séries
                </Button>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      <Content />
    </MainLayout>
  );
}
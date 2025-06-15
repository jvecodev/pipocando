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
    <MainLayout disableCustomTheme={props.disableCustomTheme}>      <Box
        sx={(theme) => ({
          width: '100%',
          height: '400px',
          position: 'relative',
          overflow: 'hidden',
          margin: '-1rem -24px 0',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(211, 100.00%, 83.10%), transparent)",
          mb: 6,
          borderRadius: theme.shape.borderRadius,
          outline: "6px solid",
          outlineColor: "hsla(220, 25%, 80%, 0.2)",
          border: "1px solid",
          borderColor: theme.palette.grey[200],
          boxShadow: "0 0 12px 8px hsla(220, 25%, 80%, 0.2)",
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.8) 100%)',
          },
          ...theme.applyStyles("dark", {
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
            boxShadow: "0 0 24px 12px hsla(210, 100%, 25%, 0.2)",
            outlineColor: "hsla(220, 20%, 42%, 0.1)",
            borderColor: theme.palette.grey[700],
            '&::before': {
              background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.8) 100%)',
            }
          }),
        })}
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
          >            <Typography
              variant="h1"
              sx={(theme) => ({
                color: theme.palette.mode === 'dark' ? 'white' : 'text.primary',
                fontWeight: 'bold',
                textShadow: theme.palette.mode === 'dark' 
                  ? '2px 2px 4px rgba(0,0,0,0.5)' 
                  : 'none',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              })}
            >
              Blog Pipocando
            </Typography>
            <Typography
              variant="h6"
              sx={(theme) => ({
                color: theme.palette.mode === 'dark' ? 'white' : 'text.secondary',
                maxWidth: '800px',
                textShadow: theme.palette.mode === 'dark'
                  ? '1px 1px 2px rgba(0,0,0,0.5)'
                  : 'none',
                mb: 3,
                fontSize: { xs: '1rem', md: '1.25rem' },
              })}
            >
              Notícias, resenhas e curiosidades sobre o mundo do cinema e séries.
              Descubra os lançamentos, críticas especializadas e listas temáticas.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/filmes')}
                startIcon={<MovieIcon />}
              >
                Explorar Filmes
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
                  borderColor: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : alpha(theme.palette.primary.main, 0.04),
                    borderColor: theme.palette.mode === 'dark' ? 'white' : 'primary.main',
                  }
                })}
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
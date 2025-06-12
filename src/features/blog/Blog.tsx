
import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../../shared-theme/AppTheme';
import Content from './Content';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Header from '../../organisms/header/Header';

export default function Blog(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Header />
      <Box 
        sx={(theme) => ({
          pt: { xs: 14, sm: 20 }, 
          py: { xs: 8, sm: 16 },
          width: "100%",
          backgroundRepeat: "no-repeat",
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(211, 100.00%, 83.10%), transparent)",
          ...theme.applyStyles("dark", {
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
          }),
        })}
      >
        <Container maxWidth="lg">
          <Content />
        </Container>
      </Box>
    </AppTheme>
  );
}
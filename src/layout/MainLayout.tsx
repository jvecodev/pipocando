import React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import AppTheme from '../shared-theme/AppTheme';
import Header from '../organisms/header/Header';
import Footer from '../organisms/footer/Footer';

type MainLayoutProps = {
  children: React.ReactNode;
  disableCustomTheme?: boolean;
};

const MainLayout: React.FC<MainLayoutProps> = ({ children, ...props }) => {
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
            "radial-gradient(ellipse 80% 50% at 50% -20%, #800020, transparent)",
          ...theme.applyStyles("dark", {
            backgroundImage:
              "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
          }),
        })}
      >
        <Container maxWidth="lg">
          {children}
        </Container>
        <Footer />
      </Box>
    </AppTheme>
  );
};

export default MainLayout;

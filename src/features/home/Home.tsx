import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import AppTheme from "../../shared-theme/AppTheme";
import Footer from "../../organisms/footer/Footer";
import Header from "../../organisms/header/Header";
import Box from '@mui/material/Box';
import Container from "@mui/material/Container";
import Hero from "./Hero";
import Features from "./Features";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Home(props: { disableCustomTheme?: boolean }) {
  const location = useLocation();
  const [showAccountDeletedMessage, setShowAccountDeletedMessage] = useState(false);

  useEffect(() => {
      // Verifica se o parâmetro accountDeleted está presente
      const searchParams = new URLSearchParams(location.search);
      if (searchParams.get('accountDeleted') === 'true') {
          setShowAccountDeletedMessage(true);
          
          // Remove o parâmetro da URL sem recarregar a página
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
      }
  }, [location]);

  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Header />
      <Hero />
      <Box >
        <Container maxWidth="lg" sx={{ py: { xs: 8, sm: 16 } }}>
        <Features />
        <Divider />
        <Divider />
        <Divider />
        <Divider />
        <Divider />
        <Footer />
        </Container>
      </Box>
      {showAccountDeletedMessage && (
        <Snackbar 
            open={showAccountDeletedMessage} 
            autoHideDuration={6000} 
            onClose={() => setShowAccountDeletedMessage(false)}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
            <Alert 
                onClose={() => setShowAccountDeletedMessage(false)} 
                severity="success" 
                variant="filled"
                sx={{ width: '100%', boxShadow: 2 }}
            >
                Sua conta foi excluída com sucesso.
            </Alert>
        </Snackbar>
    )}
    </AppTheme>
  );
}

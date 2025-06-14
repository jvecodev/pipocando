import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import AppTheme from "../../shared-theme/AppTheme";
import Hero from "./components/Hero";
// import Highlights from "./components/Highlights";
import Features from "./components/Features";
import FAQ from "./components/FAQ";
import Footer from "../../organisms/footer/Footer";
import Header from "../../organisms/header/Header";
import Box from '@mui/material/Box';
import Container from "@mui/material/Container";


export default function Home(props: { disableCustomTheme?: boolean }) {
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
        <FAQ />
        <Divider />
        <Footer />
        </Container>
      </Box>
    </AppTheme>
  );
}

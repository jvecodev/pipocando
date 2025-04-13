import * as React from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import AppTheme from "../../shared-theme/AppTheme";
import Hero from "./components/Hero";
import Highlights from "./components/Highlights";
import Pricing from "./components/Pricing";
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
      <Box sx={{ paddingTop: "calc(var(--template-frame-height, 0px) + 120px)" }}>
        <Container maxWidth="lg">
        <Features />
        <Divider />
        <Divider />
        <Highlights />
        <Divider />
        <Pricing />
        <Divider />
        <FAQ />
        <Divider />
        <Footer />
        </Container>
      </Box>
    </AppTheme>
  );
}

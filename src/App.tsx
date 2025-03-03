import React, { useState, useEffect } from "react";
import { Container, Typography, Link, AppBar, Toolbar, Button, Box } from "@mui/material";
import { FlashOn } from "@mui/icons-material";

export default function App() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Meu App</Typography>
        </Toolbar>
      </AppBar>
      <Container sx={{ textAlign: "center", mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" gap={1}>
          <FlashOn fontSize="large" color="primary" />
          <Typography
            variant="h3"
            gutterBottom
            sx={{ visibility: visible ? "visible" : "hidden" }}
          >
            Meu App
          </Typography>
          <FlashOn fontSize="large" color="primary" />
        </Box>
        <Typography variant="h6" gutterBottom>
          Um aplicativo simples utilizando Material UI e React.
        </Typography>
        <Box mt={4}>
          <Button variant="contained" color="primary" href="#">
            Explorar
          </Button>
        </Box>
        <Box mt={4}>
          <Link href="https://reactjs.org" target="_blank" rel="noopener noreferrer" variant="h6">
            Learn React
          </Link>
        </Box>
      </Container>
    </>
  );
}

import * as React from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import Terms from "../../organisms/terms/terms";

const StyledBox = styled("div")(({ theme }) => ({
  alignSelf: "center",
  width: "100%",
  height: 400,
  marginTop: theme.spacing(8),
  borderRadius: theme.shape.borderRadius,
  outline: "6px solid",
  outlineColor: "hsla(220, 25%, 80%, 0.2)",
  border: "1px solid",
  borderColor: theme.palette.grey[200],
  boxShadow: "0 0 12px 8px hsla(220, 25%, 80%, 0.2)",
  backgroundImage: `url('/assets/img/main-screen.jpg')`,
  backgroundSize: "cover",
  [theme.breakpoints.up("sm")]: {
    marginTop: theme.spacing(10),
    height: 500,
  },
  ...theme.applyStyles("dark", {
    boxShadow: "0 0 24px 12px hsla(210, 100%, 25%, 0.2)",
    backgroundImage: `url('/assets/img/main-screen.jpg')`,

    outlineColor: "hsla(220, 20%, 42%, 0.1)",
    borderColor: theme.palette.grey[700],
  }),
}));

export default function Hero() {
  const [openTerms, setOpenTerms] = React.useState(false);
  const handleOpenTerms = () => setOpenTerms(true);
  const handleCloseTerms = () => setOpenTerms(false)

  return (    <Box
      id="hero"
      sx={(theme) => ({
        width: "100%",
        backgroundRepeat: "no-repeat",
        backgroundImage:
          "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(128, 0, 32, 0.1), transparent)",
        ...theme.applyStyles("dark", {
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(33, 150, 243, 0.08), transparent)",
        }),
      })}
    >
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={2}
          useFlexGap
          sx={{ alignItems: "flex-start", width: { xs: "100%", sm: "70%" }, mt: { xs: 6, md: 12 }, mb: 6 }}
        >
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '2.5rem', md: '4rem' },
              color: 'text.primary',
              textAlign: 'left',
            }}
          >
            Pipocando
          </Typography>
          <Typography
            variant="h5"
            sx={{
              textAlign: "left",
              color: "text.secondary",
              fontWeight: 500,
              maxWidth: 800,
              mb: 4,
              fontSize: { xs: '1.1rem', md: '1.5rem' },
            }}
          >
            Bem-vindo ao Pipocando, um fórum de filmes onde os usuários podem discutir sobre os lançamentos, comentar suas opiniões, e compartilhar recomendações.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            useFlexGap
            sx={{ pt: 2, width: { xs: "100%", sm: "350px" } }}
          ></Stack>          <Box sx={{ mt: 4, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="subtitle1"
              sx={(theme) => ({
                fontWeight: 700,
                letterSpacing: 1,
                fontSize: { xs: '1.1rem', md: '1.2rem' },
                textShadow: '0 1px 8px rgba(128,0,32,0.10)',
                color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
              })}
            >
              Leia nossos termos
            </Typography>
            <Button
              variant="outlined"
              sx={(theme) => ({
                fontWeight: 700,
                textTransform: 'none',
                fontSize: { xs: '1rem', md: '1.1rem' },
                px: 2,
                py: 0.5,
                borderRadius: 2,
                boxShadow: '0 2px 8px 0 rgba(128,0,32,0.08)',
                borderWidth: 2,
                ml: 1,
                transition: 'all 0.2s',
                ...(theme.palette.mode === 'dark' ? {
                  color: '#fff',
                  borderColor: '#fff',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: '#fff',
                  },
                } : {
                  color: theme.palette.primary.main,
                  borderColor: theme.palette.primary.main,
                  '&:hover': {
                    backgroundColor: theme.palette.primary.main,
                    color: 'white',
                    borderColor: theme.palette.primary.main,
                  },
                }),
              })}
              onClick={handleOpenTerms}
            >
              Termos de uso
            </Button>
            <Terms open={openTerms} onClose={handleCloseTerms} />
          </Box>
        </Stack>
        <StyledBox id="image" />
      </Container>
    </Box>
  );
}

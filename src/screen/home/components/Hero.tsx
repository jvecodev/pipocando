import * as React from "react";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { styled } from "@mui/material/styles";
import { colorSchemes } from "../../../shared-theme/themePrimitives";
import { Box,  } from "@mui/material";
import Terms from "../../../organisms/terms/terms";


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

  return (
    <Box
      id="hero"
      sx={(theme) => ({
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
      <Container
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pt: { xs: 14, sm: 20 },
          pb: { xs: 8, sm: 12 },
        }}
      >
        <Stack
          spacing={2}
          useFlexGap
          sx={{ alignItems: "center", width: { xs: "100%", sm: "70%" } }}
        >
          <Typography variant="h1" gutterBottom>
          Pipocando
        </Typography>
          <Typography
            sx={{
              textAlign: "center",
              color: "text.secondary",
              width: { sm: "100%", md: "80%", fontSize: "1.2rem" },
            }}
          >
            Bem-vindo ao Pipocando, um fórum de filmes onde os usuários podem
            discutir sobre os lançamentos, comentar suas opiniões, e
            compartilhar recomendações.
          </Typography>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            useFlexGap
            sx={{ pt: 2, width: { xs: "100%", sm: "350px" } }}
          ></Stack>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            Leia nossos termos&nbsp;
            <Button onClick={handleOpenTerms} color="primary">
              Termos de uso
            </Button>
            <Terms open={openTerms} onClose={handleCloseTerms} />

            
          </Typography>
        </Stack>
        <StyledBox id="image" />
      </Container>
    </Box>
  );
}

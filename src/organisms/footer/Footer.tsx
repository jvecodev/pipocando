import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import IconButton from "@mui/material/IconButton";

import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";

import Typography from "@mui/material/Typography";
import GitHubIcon from "@mui/icons-material/GitHub";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import TwitterIcon from "@mui/icons-material/X";
import Sitemark from "../siteMarkIcon/SitemarkIcon";
import Terms from "../terms/terms";

function Copyright() {
  return (
    <Typography variant="body2" sx={{ color: "text.secondary", mt: 1 }}>
      {"Copyright © "}
      <Link color="text.secondary">Pipocando</Link>
      &nbsp;
      {new Date().getFullYear()}
    </Typography>
  );
}

export default function Footer() {
  const [openTerms, setOpenTerms] = React.useState(false);
  const handleOpenTerms = () => setOpenTerms(true);
  const handleCloseTerms = () => setOpenTerms(false);

  return (
    <Container
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 4, sm: 8 },
        py: { xs: 8, sm: 10 },
        textAlign: { sm: "center", md: "left" },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          width: "100%",
          justifyContent: "space-between",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 4,
            minWidth: { xs: "100%", sm: "60%" },
          }}
        >          <Box sx={{ width: { xs: "100%", sm: "60%" } }}>
            <Sitemark />
            <Typography
              variant="body2"
              gutterBottom
              sx={(theme) => ({ 
                fontWeight: 600, 
                mt: 2,
                color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
              })}
            >
              Participe da nossa comunidade!
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
              Inscreva-se para receber atualizações, sobre o Pipocando.
            </Typography>
          
          </Box>
        </Box>        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography 
            variant="body2" 
            sx={(theme) => ({ 
              fontWeight: "medium",
              color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
            })}
          >
            Product
          </Typography>
          <Link color="text.secondary" variant="body2" href="#">
            Features
          </Link>

          <Link color="text.secondary" variant="body2" href="#">
            Highlights
          </Link>
          <Link color="text.secondary" variant="body2" href="#">
            FAQs
          </Link>
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography 
            variant="body2" 
            sx={(theme) => ({ 
              fontWeight: "medium",
              color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
            })}
          >
            Company
          </Typography>
          <Link color="text.secondary" variant="body2" href="#">
            About us
          </Link>
        </Box>
        <Box
          sx={{
            display: { xs: "none", sm: "flex" },
            flexDirection: "column",
            gap: 1,
          }}
        >
          <Typography 
            variant="body2" 
            sx={(theme) => ({ 
              fontWeight: "medium",
              color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
            })}
          >
            Legal
          </Typography>
          <Link color="text.secondary" variant="body2" href="#">
            Terms
          </Link>
          <Link color="text.secondary" variant="body2" href="#">
            Privacy
          </Link>
          <Link color="text.secondary" variant="body2" href="#">
            Contact
          </Link>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          pt: { xs: 4, sm: 8 },
          width: "100%",
          borderTop: "1px solid",
          borderColor: "divider",
        }}
      >        <div>
          <Button 
            onClick={handleOpenTerms} 
            sx={(theme) => ({
              color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              },
            })}
          >
            Politicas de privacidade
          </Button>
          <Typography sx={{ display: "inline", mx: 0.5, opacity: 0.5 }}>
            &nbsp;•&nbsp;
          </Typography>
          <Button 
            onClick={handleOpenTerms} 
            sx={(theme) => ({
              color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              },
            })}
          >
            Termos de uso
          </Button>
          <Copyright />
          <Terms open={openTerms} onClose={handleCloseTerms} />
        </div>
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          sx={{ justifyContent: "left", color: "text.secondary" }}
        >
          <IconButton
            color="inherit"
            size="small"
            href="#"
            aria-label="GitHub"
            sx={{ alignSelf: "center" }}
          >
            <GitHubIcon />
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            href="#"
            aria-label="X"
            sx={{ alignSelf: "center" }}
          >
            <TwitterIcon />
          </IconButton>
          <IconButton
            color="inherit"
            size="small"
            href="#"
            aria-label="LinkedIn"
            sx={{ alignSelf: "center" }}
          >
            <LinkedInIcon />
          </IconButton>
        </Stack>
      </Box>
    </Container>
  );
}

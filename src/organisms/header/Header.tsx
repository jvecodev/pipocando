import * as React from "react";
import { alpha, styled } from "@mui/material/styles";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Container from "@mui/material/Container";
import MenuIcon from "@mui/icons-material/Menu";
import ColorModeIconDropdown from "../../shared-theme/ColorModeIconDropdown";
import Sitemark from "../siteMarkIcon/SitemarkIcon";
import { Link } from "react-router-dom";
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import AccountCircle from '@mui/icons-material/AccountCircle';
import Logout from '@mui/icons-material/Logout';

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  flexShrink: 0,
  borderRadius: `calc(${theme.shape.borderRadius}px + 8px)`,
  backdropFilter: "blur(24px)",
  border: "1px solid",
  borderColor: theme.palette.divider,
  backgroundColor: alpha(theme.palette.background.default, 0.4),
  boxShadow: theme.shadows[1],
  padding: "8px 12px",
}));

function Header() {
  const [userName, setUserName] = React.useState<string | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  React.useEffect(() => {
    setUserName(localStorage.getItem('username'));
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setUserName(null);
    handleClose();
    window.location.reload();
  };

  return (
    <AppBar
      position="fixed"
      enableColorOnDark
      sx={{
        boxShadow: 0,
        bgcolor: "transparent",
        backgroundImage: "none",
        mt: "calc(var(--template-frame-height, 0px) + 28px)",
      }}
    >
      <Container maxWidth="lg">
        <StyledToolbar variant="dense" disableGutters>
          <Box
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", px: 0 }}
          >
            <Sitemark />
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <Button
                component={Link}
                to="/"
                variant="text"
                color="info"
                size="small"
              >
                Home
              </Button>
              <Button
                component={Link}
                to="/blog"
                variant="text"
                color="info"
                size="small"
              >
                Blog
              </Button>
              <Button
                component={Link}
                to="/filmes"
                variant="text"
                color="info"
                size="small"
              >
                Filmes
              </Button>
              <Button
                component={Link}
                to="/series"
                variant="text"
                color="info"
                size="small"
              >
                Séries
              </Button>
              <Button
                component={Link}
                to="/faq"
                variant="text"
                color="info"
                size="small"
                sx={{ minWidth: 0 }}
              >
                FAQ
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: { xs: "none", md: "flex" },
              gap: 1,
              alignItems: "center",
            }}
          >
            {userName ? (
              <>
                <Button
                  color="primary"
                  variant="text"
                  size="small"
                  onClick={handleMenu}
                  sx={(theme) => ({
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark' ? theme.palette.primary.light : theme.palette.primary.dark,
                    background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    borderRadius: 2,
                    px: 2,
                    textTransform: 'none',
                  })}
                >
                  {userName}
                </Button>
                <Menu
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                  <MenuItem component={Link} to="/perfil" onClick={handleClose}>
                    <ListItemIcon>
                      <AccountCircle fontSize="small" />
                    </ListItemIcon>
                    Meu Perfil
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  component={Link}
                  to="/login"
                  color="primary" 
                  variant="text" 
                  size="small"
                >
                  Entrar
                </Button>
                <Button 
                  component={Link}
                  to="/signup"
                  color="primary" 
                  variant="contained" 
                  size="small"
                >
                  Cadastrar
                </Button>
              </>
            )}
            <ColorModeIconDropdown />
          </Box>

          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <ColorModeIconDropdown />
            <IconButton aria-label="Menu button">
              <MenuIcon />
            </IconButton>
          </Box>
        </StyledToolbar>
      </Container>
    </AppBar>
  );
}

export default Header;

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
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import CloseIcon from '@mui/icons-material/Close';

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
  padding: "8px 12px",
}));

function Header() {
  const [userName, setUserName] = React.useState<string | null>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const open = Boolean(anchorEl);

  React.useEffect(() => {
    // Obter nome do usuário do objeto 'user' no localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUserName(userData.name);
      } catch (e) {
        console.error('Erro ao recuperar dados do usuário:', e);
        setUserName(null);
      }
    }
  }, []);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  const handleMobileMenuClose = () => {
    setMobileMenuOpen(false);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Remova esta linha se estiver usando a opção 2
    // localStorage.removeItem('username');
    setUserName(null);
    handleClose();
    window.location.href = "/";
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
            <Sitemark />            <Box sx={{ display: { xs: "none", md: "flex" } }}>
                <Button
                component={Link}
                to="/"
                variant="text"
                color="info"
                size="medium"
                sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
                  textTransform: 'none',
                  fontSize: '1rem', // aumenta o tamanho da fonte
                  '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  },
                })}
                >
                Home
                </Button>
              <Button
                component={Link}
                to="/blog"
                variant="text"
                color="info"
                size="medium"
                sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
                  textTransform: 'none',
                  fontSize: '1rem', // aumenta o tamanho da fonte
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  },
                })}
              >
                Blog
              </Button>
              <Button
                component={Link}
                to="/filmes"
                variant="text"
                color="info"
                size="medium"
                sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
                  textTransform: 'none',
                  fontSize: '1rem', // aumenta o tamanho da fonte
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  },
                })}
              >
                Filmes
              </Button>
              <Button
                component={Link}
                to="/series"
                variant="text"
                color="info"
                size="medium"
                sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
                  textTransform: 'none',
                  fontSize: '1rem', // aumenta o tamanho da fonte
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  },
                })}
              >
                Séries
              </Button>
              <Button
                component={Link}
                to="/faq"
                variant="text"
                color="info"
                size="medium"
                sx={{ 
                  minWidth: 0,
                  textTransform: 'none',
                  fontSize: '1rem', // aumenta o tamanho da fonte
                  color: (theme) => theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
                  '&:hover': {
                    backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                  },
                }}
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
              <>                <Button
                  color="primary"
                  variant="text"
                  size="small"
                  onClick={handleMenu}
                  sx={(theme) => ({
                    fontWeight: 700,
                    color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
                    background: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    borderRadius: 2,
                    px: 2,
                    textTransform: 'none',
                    fontSize: '1rem', // aumenta o tamanho da fonte
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
                    },
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
            ) : (              <>
                <Button 
                  component={Link}
                  to="/login"
                  color="primary" 
                  variant="text" 
                  size="small"
                  sx={(theme) => ({
                    color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    },
                  })}
                >
                  Entrar
                </Button>
                <Button 
                  component={Link}
                  to="/signup"
                  color="primary" 
                  variant="contained" 
                  size="small"
                  sx={(theme) => ({
                    color: theme.palette.mode === 'dark' ? '#000' : '#fff',
                    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.main : theme.palette.primary.main,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.dark,
                    },
                  })}
                >
                  Cadastrar
                </Button>
              </>
            )}
            <ColorModeIconDropdown />
          </Box>          <Box sx={{ display: { xs: "flex", md: "none" }, gap: 1 }}>
            <ColorModeIconDropdown />
            <IconButton 
              aria-label="Menu button"
              onClick={handleMobileMenuToggle}
              sx={(theme) => ({
                color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.text.primary,
              })}
            >
              <MenuIcon />
            </IconButton>
          </Box>        </StyledToolbar>
      </Container>

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={handleMobileMenuClose}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Sitemark />
          <IconButton onClick={handleMobileMenuClose}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List>
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              to="/" 
              onClick={handleMobileMenuClose}
              sx={{ textTransform: 'none' }}
            >
              <ListItemText primary="Home" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              to="/blog" 
              onClick={handleMobileMenuClose}
              sx={{ textTransform: 'none' }}
            >
              <ListItemText primary="Blog" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              to="/filmes" 
              onClick={handleMobileMenuClose}
              sx={{ textTransform: 'none' }}
            >
              <ListItemText primary="Filmes" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              to="/series" 
              onClick={handleMobileMenuClose}
              sx={{ textTransform: 'none' }}
            >
              <ListItemText primary="Séries" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton 
              component={Link} 
              to="/faq" 
              onClick={handleMobileMenuClose}
              sx={{ textTransform: 'none' }}
            >
              <ListItemText primary="FAQ" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />
        <Box sx={{ p: 2 }}>
          {userName ? (
            <List>
              <ListItem disablePadding>
                <ListItemButton 
                  component={Link} 
                  to="/perfil" 
                  onClick={handleMobileMenuClose}
                  sx={{ textTransform: 'none' }}
                >
                  <ListItemIcon>
                    <AccountCircle />
                  </ListItemIcon>
                  <ListItemText primary={`Olá, ${userName}`} />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => {
                    handleLogout();
                    handleMobileMenuClose();
                  }}
                  sx={{ textTransform: 'none' }}
                >
                  <ListItemIcon>
                    <Logout />
                  </ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItemButton>
              </ListItem>
            </List>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button 
                component={Link}
                to="/login"
                variant="text"
                fullWidth
                onClick={handleMobileMenuClose}
                sx={{ textTransform: 'none' }}
              >
                Entrar
              </Button>
              <Button 
                component={Link}
                to="/signup"
                variant="contained"
                fullWidth
                onClick={handleMobileMenuClose}
                sx={{ textTransform: 'none' }}
              >
                Cadastrar
              </Button>
            </Box>
          )}
        </Box>
      </Drawer>
    </AppBar>
  );
}

export default Header;
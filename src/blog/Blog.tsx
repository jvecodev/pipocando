import CssBaseline from '@mui/material/CssBaseline';
import AppTheme from '../shared-theme/AppTheme';
import Content from './Content';
import Header from './Header';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

export default function Blog(props: { disableCustomTheme?: boolean }) {
  return (
    <AppTheme {...props}>
      <CssBaseline enableColorScheme />
      <Header />
      <Box sx={{ paddingTop: 'calc(var(--template-frame-height, 0px) + 120px)' }}>
        <Container maxWidth="lg">
          <Content />
        </Container>
      </Box>
    </AppTheme>
  );
}
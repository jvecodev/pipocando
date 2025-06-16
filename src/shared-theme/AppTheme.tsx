import * as React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery'; // Importação correta do hook
import { colorSchemes, extendTheme } from './themePrimitives';

interface AppThemeProps {
  children: React.ReactNode;
  /**
   * This is for the docs site. You can ignore it or remove it.
   */
  disableCustomTheme?: boolean;
  themeComponents?: ThemeOptions['components'];
}

/**
 * Provedor de tema para a aplicação Pipocando
 *
 * @param {Object} props Propriedades do componente
 * @param {React.ReactNode} props.children Componentes filhos que receberão o tema
 * @returns {JSX.Element} Provider de tema configurado com o design system do Pipocando
 */
export default function AppTheme(props: AppThemeProps) {
  const { children, disableCustomTheme, themeComponents } = props;

  // Usando o hook como função normal, não como método do React
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const mode = prefersDarkMode ? 'dark' : 'light';

  const theme = React.useMemo(() => {
    if (disableCustomTheme) {
      return createTheme();
    }

    // Usar a função extendTheme que já contém todas as configurações necessárias
    const baseTheme = extendTheme(mode);

    // Adicionar componentes personalizados extras se fornecidos
    if (themeComponents) {
      return createTheme(baseTheme, {
        components: {
          ...baseTheme.components,
          ...themeComponents,
        },
      });
    }

    return baseTheme;
  }, [disableCustomTheme, themeComponents, mode]);

  if (disableCustomTheme) {
    return <React.Fragment>{children}</React.Fragment>;
  }

  return (
    <ThemeProvider theme={theme} disableTransitionOnChange>
      {children}
    </ThemeProvider>
  );
}

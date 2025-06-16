import { createTheme, alpha, PaletteMode, Shadows } from "@mui/material/styles";
import { dark } from "@mui/material/styles/createPalette";

declare module "@mui/material/Paper" {
  interface PaperPropsVariantOverrides {
    highlighted: true;
  }
}
declare module "@mui/material/styles/createPalette" {
  interface ColorRange {
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  }

  interface PaletteColor extends ColorRange {}

  interface Palette {
    baseShadow: string;
    brand: {
      red: string;
      orange: string;
      cremePipoca: string;
      carameloPipoca: string;
      carameloEscuro: string;
      borgonhaFundo: string;
      cremeSuave: string;
      begeAreia: string;
    };
  }
}

const defaultTheme = createTheme();

const customShadows: Shadows = [...defaultTheme.shadows];

// Novas cores da paleta Pipocando
export const cremePipoca = "#F2F1E4";
export const carameloPipoca = "#D68400";
export const carameloEscuro = "#A94F00";
export const borgonhaFundo = "#7B0026";
export const cremeSuave = "#E3DABE";
export const begeAreia = "#C8B994";

// Adaptação das cores antigas para a nova paleta
export const brand = {
  50: "#800020",
  100: "#800020",
  200: "#800020",
  300: "#800020",
  400: "#800020",
  500: "#800020",
  600: "#800020",
  700: "#800020",
  800: "#800020",
  900: "#800020",
};

export const gray = {
  50: cremePipoca,
  100: cremeSuave,
  200: begeAreia,
  300: "#BAAD89",
  400: "#9D9178",
  500: "#7D7460",
  600: "#5D574A",
  700: "#403D34",
  800: "#252320",
  900: "#0A0908",
};

export const green = {
  50: "#F5F9E8",
  100: "#EBF2D1",
  200: "#D7E5A3",
  300: "#C3D875",
  400: "#AFCB47",
  500: "#8DA438",
  600: "#6A7B2A",
  700: "#46521C",
  800: "#23290E",
  900: "#111405",
};

export const orange = {
  50: "#FEF6E8",
  100: "#FDECD0",
  200: "#FBD8A1",
  300: carameloPipoca, // Usando o caramelo pipoca como base
  400: "#D68400", // Caramelo principal
  500: carameloEscuro, // Caramelo Escuro
  600: "#874000",
  700: "#653000",
  800: "#432000",
  900: "#211000",
};

export const red = {
  50: "#FFF0F2",
  100: "#FFE1E5",
  200: "#FFC3CB",
  300: "#FFA5B1",
  400: "#FF8797",
  500: "#E5254A",
  600: borgonhaFundo, // Usando o borgonha como base
  700: "#580019", // Mais escuro que o borgonha
  800: "#350010",
  900: "#130006",
};

export const getDesignTokens = (mode: PaletteMode) => {
  customShadows[1] =
    mode === "dark"
      ? "hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px"
      : "hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px";

  return {
    palette: {
      mode,
      primary: {
        light: brand[200],
        main: carameloPipoca,
        dark: carameloEscuro,
        contrastText: cremePipoca,
        ...(mode === "dark" && {
          contrastText: cremePipoca,
          light: carameloPipoca,
          main: carameloEscuro,
          dark: "#8D4200",
        }),
      },
      info: {
        light: brand[100],
        main: begeAreia,
        dark: brand[600],
        contrastText: gray[800],
        ...(mode === "dark" && {
          contrastText: begeAreia,
          light: carameloEscuro,
          main: carameloPipoca,
          dark: "#8D4200",
        }),
      },
      brand:{
        red: borgonhaFundo,
        orange: carameloPipoca,
        cremePipoca: cremePipoca,
        carameloPipoca: carameloPipoca,
        carameloEscuro: carameloEscuro,
        borgonhaFundo: borgonhaFundo,
        cremeSuave: cremeSuave,
        begeAreia: begeAreia
      },
      warning: {
        light: orange[300],
        main: carameloPipoca,
        dark: carameloEscuro,
        ...(mode === "dark" && {
          light: carameloPipoca,
          main: carameloEscuro,
          dark: "#8D4200",
        }),
      },
      error: {
        light: red[300],
        main: borgonhaFundo,
        dark: red[800],
        ...(mode === "dark" && {
          light: borgonhaFundo,
          main: "#9E0033",
          dark: "#700025",
        }),
      },
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
        ...(mode === "dark" && {
          light: green[400],
          main: green[500],
          dark: green[700],
        }),
      },
      grey: {
        ...gray,
      },
      divider: mode === "dark" ? alpha(begeAreia, 0.3) : alpha(begeAreia, 0.2),
      background: {
        default: cremePipoca,
        paper: cremeSuave,
        ...(mode === "dark" && {
          default: "#2A1E14",  // Mantenho a cor base escura
          paper: "#3A2D1E",    // Mantenho a cor base escura
          // Podemos adicionar gradientes por meio do getThemedComponents se necessário
        }),
      },
      text: {
        primary: gray[800],
        secondary: gray[600],
        warning: carameloPipoca,
        ...(mode === "dark" && {
          primary: cremePipoca,
          secondary: cremeSuave,
        }),
      },
      action: {
        hover: alpha(begeAreia, 0.2),
        selected: `${alpha(begeAreia, 0.3)}`,
        ...(mode === "dark" && {
          hover: alpha(begeAreia, 0.3),
          selected: alpha(begeAreia, 0.4),
        }),
      },
    },
    typography: {
      fontFamily: "Inter, sans-serif",
      h1: {
        fontSize: defaultTheme.typography.pxToRem(48),
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: -0.5,
      },
      h2: {
        fontSize: defaultTheme.typography.pxToRem(36),
        fontWeight: 600,
        lineHeight: 1.2,
      },
      h3: {
        fontSize: defaultTheme.typography.pxToRem(28),
        fontWeight: 600,
        lineHeight: 1.3,
      },
      h4: {
        fontSize: defaultTheme.typography.pxToRem(24),
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: defaultTheme.typography.pxToRem(20),
        fontWeight: 500,
        lineHeight: 1.4,
      },
      h6: {
        fontSize: defaultTheme.typography.pxToRem(18),
        fontWeight: 500,
        lineHeight: 1.5,
      },
      subtitle1: {
        fontSize: defaultTheme.typography.pxToRem(16),
        lineHeight: 1.6,
        fontWeight: 400,
      },
      subtitle2: {
        fontSize: defaultTheme.typography.pxToRem(14),
        lineHeight: 1.6,
        fontWeight: 400,
      },
      body1: {
        fontSize: defaultTheme.typography.pxToRem(16),
        lineHeight: 1.6,
        fontWeight: 400,
      },
      body2: {
        fontSize: defaultTheme.typography.pxToRem(14),
        lineHeight: 1.6,
        fontWeight: 400,
      },
    },
    shape: {
      borderRadius: 8,
    },
    shadows: customShadows,
  };
};

export const colorSchemes = {
  light: {
    palette: {
      brand: {
       main: borgonhaFundo,
       light: carameloPipoca,
       cremePipoca: cremePipoca,
       carameloPipoca: carameloPipoca,
       carameloEscuro: carameloEscuro,
       borgonhaFundo: borgonhaFundo,
       cremeSuave: cremeSuave,
       begeAreia: begeAreia
      },
      primary: {
        light: brand[200],
        main: carameloPipoca,
        dark: carameloEscuro,
        contrastText: cremePipoca,
      },
      info: {
        light: begeAreia,
        main: begeAreia,
        dark: gray[600],
        contrastText: gray[800],
      },
      warning: {
        light: orange[300],
        main: carameloPipoca,
        dark: carameloEscuro,
      },
      error: {
        light: red[300],
        main: borgonhaFundo,
        dark: red[800],
      },
      success: {
        light: green[300],
        main: green[400],
        dark: green[800],
      },
      grey: {
        ...gray,
      },
      divider: alpha(begeAreia, 0.2),
      background: {
        default: cremePipoca,
        paper: cremeSuave,
      },
      text: {
        primary: gray[800],
        secondary: gray[600],
        warning: carameloPipoca,
      },
      action: {
        hover: alpha(begeAreia, 0.2),
        selected: `${alpha(begeAreia, 0.3)}`,
      },
      baseShadow:
        "hsla(220, 30%, 5%, 0.07) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.07) 0px 8px 16px -5px",
    },
  },
  dark: {
    palette: {
      primary: {
        contrastText: cremePipoca,
        light: carameloPipoca,
        main: carameloEscuro,
        dark: "#8D4200",
      },
      info: {
        contrastText: begeAreia,
        light: carameloEscuro,
        main: carameloPipoca,
        dark: "#8D4200",
      },
      warning: {
        light: carameloPipoca,
        main: carameloEscuro,
        dark: "#8D4200",
      },
      error: {
        light: borgonhaFundo,
        main: "#9E0033",
        dark: "#700025",
      },
      success: {
        light: green[400],
        main: green[500],
        dark: green[700],
      },
      grey: {
        ...gray,
      },
      divider: alpha(begeAreia, 0.3),
      background: {
        default: "#2A1E14",
        paper: "#3A2D1E",
      },
      text: {
        primary: cremePipoca,
        secondary: cremeSuave,
      },
      action: {
        hover: alpha(begeAreia, 0.3),
        selected: alpha(begeAreia, 0.4),
      },
      baseShadow:
        "hsla(220, 30%, 5%, 0.7) 0px 4px 16px 0px, hsla(220, 25%, 10%, 0.8) 0px 8px 16px -5px",
    },
  },
};

export const getThemedComponents = (theme: any) => {
  const components = {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: "#6b6b6b #2b2b2b",
          "&::-webkit-scrollbar, & *::-webkit-scrollbar": {
            backgroundColor: theme.palette.mode === "dark" ? "#2b2b2b" : "#fafafa",
            width: 12,
          },
          "&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track": {
            backgroundColor: theme.palette.mode === "dark" ? "#2b2b2b" : "#fafafa",
          },
          "&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb": {
            borderRadius: 8,
            backgroundColor: theme.palette.mode === "dark" ? "#6b6b6b" : "#c5c5c5",
            minHeight: 24,
          },
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }: any) => ({
          borderRadius: theme.shape.borderRadius,
          ...(theme.palette.mode === "dark" && {
            borderColor: alpha(begeAreia, 0.1),
          }),
        }),
      },
      variants: [
        {
          props: { variant: "highlighted" },
          style: ({ theme }: any) => ({
            backgroundColor: alpha(begeAreia, 0.1),
          }),
        },
      ],
    },
  };

  return components;
};

// Método auxiliar para aplicação de estilos baseados no modo
declare module "@mui/material/styles" {
  interface Theme {
    applyStyles: (mode: string, styles: Record<string, any>) => Record<string, any>;
  }
}

export const extendTheme = (colorScheme: string) => {
  const themeOptions = getDesignTokens(colorScheme as PaletteMode);
  let theme = createTheme(themeOptions);

  theme = {
    ...theme,
    applyStyles: (mode: string, styles: Record<string, any>) => {
      return mode === colorScheme ? styles : {};
    },
  };

  return createTheme(theme, {
    components: getThemedComponents(theme),
  });
};

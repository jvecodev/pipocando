import { Theme, alpha, Components } from '@mui/material/styles';
import { svgIconClasses } from '@mui/material/SvgIcon';
import { typographyClasses } from '@mui/material/Typography';
import { buttonBaseClasses } from '@mui/material/ButtonBase';
import { chipClasses } from '@mui/material/Chip';
import { iconButtonClasses } from '@mui/material/IconButton';
import { gray, green, cremePipoca, carameloEscuro, borgonhaFundo, cremeSuave, begeAreia } from '../themePrimitives';

/* eslint-disable import/prefer-default-export */
export const dataDisplayCustomizations: Components<Theme> = {
  MuiList: {
    styleOverrides: {
      root: {
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      },
    },
  },
  MuiListItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        [`& .${svgIconClasses.root}`]: {
          width: '1rem',
          height: '1rem',
          color: theme.palette.text.secondary,
        },
        [`& .${typographyClasses.root}`]: {
          fontWeight: 500,
        },
        [`& .${buttonBaseClasses.root}`]: {
          display: 'flex',
          gap: 8,
          padding: '2px 8px',
          borderRadius: theme.shape.borderRadius,
          opacity: 0.7,
          '&.Mui-selected': {
            opacity: 1,
            backgroundColor: alpha(theme.palette.action.selected, 0.3),
            [`& .${svgIconClasses.root}`]: {
              color: theme.palette.text.primary,
            },
            '&:focus-visible': {
              backgroundColor: alpha(theme.palette.action.selected, 0.3),
            },
            '&:hover': {
              backgroundColor: alpha(theme.palette.action.selected, 0.5),
            },
          },
          '&:focus-visible': {
            backgroundColor: 'transparent',
          },
        },
      }),
    },
  },
  MuiListItemText: {
    styleOverrides: {
      primary: ({ theme }) => ({
        fontSize: theme.typography.body2.fontSize,
        fontWeight: 500,
        lineHeight: theme.typography.body2.lineHeight,
      }),
      secondary: ({ theme }) => ({
        fontSize: theme.typography.caption.fontSize,
        lineHeight: theme.typography.caption.lineHeight,
      }),
    },
  },
  MuiListSubheader: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: 'transparent',
        padding: '4px 8px',
        fontSize: theme.typography.caption.fontSize,
        fontWeight: 500,
        lineHeight: theme.typography.caption.lineHeight,
      }),
    },
  },
  MuiListItemIcon: {
    styleOverrides: {
      root: {
        minWidth: 0,
      },
    },
  },
  MuiChip: {
    defaultProps: {
      size: 'small',
    },
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 16,
        fontWeight: 500,
        borderWidth: 1,
        borderStyle: 'solid',
        variants: [
          {
            props: {
              variant: 'filled',
            },
            style: {
              backgroundColor: begeAreia,
              color: gray[800],
              ...theme.applyStyles('dark', {
                backgroundColor: carameloEscuro,
                color: cremePipoca,
              }),
            },
          },
          {
            props: {
              variant: 'outlined',
              color: 'default',
            },
            style: {
              borderColor: begeAreia,
              backgroundColor: cremeSuave,
              [`& .${chipClasses.label}`]: {
                color: gray[700],
              },
              [`& .${chipClasses.icon}`]: {
                color: gray[700],
              },
              ...theme.applyStyles('dark', {
                borderColor: carameloEscuro,
                backgroundColor: '#2A1E14',
                [`& .${chipClasses.label}`]: {
                  color: cremeSuave,
                },
                [`& .${chipClasses.icon}`]: {
                  color: cremeSuave,
                },
              }),
            },
          },
          {
            props: {
              color: 'success',
            },
            style: {
              borderColor: green[200],
              backgroundColor: green[50],
              [`& .${chipClasses.label}`]: {
                color: green[500],
              },
              [`& .${chipClasses.icon}`]: {
                color: green[500],
              },
              ...theme.applyStyles('dark', {
                borderColor: green[800],
                backgroundColor: alpha(green[900], 0.8),
                [`& .${chipClasses.label}`]: {
                  color: green[300],
                },
                [`& .${chipClasses.icon}`]: {
                  color: green[300],
                },
              }),
            },
          },
          {
            props: {
              color: 'error',
            },
            style: {
              borderColor: borgonhaFundo,
              backgroundColor: alpha(borgonhaFundo, 0.1),
              [`& .${chipClasses.label}`]: {
                color: borgonhaFundo,
              },
              [`& .${chipClasses.icon}`]: {
                color: borgonhaFundo,
              },
              ...theme.applyStyles('dark', {
                borderColor: borgonhaFundo,
                backgroundColor: alpha(borgonhaFundo, 0.3),
                [`& .${chipClasses.label}`]: {
                  color: alpha(cremePipoca, 0.8),
                },
                [`& .${chipClasses.icon}`]: {
                  color: alpha(cremePipoca, 0.8),
                },
              }),
            },
          },
          
          // Mais variantes de Chip...
        ],
      }),
    },
  },
  MuiTablePagination: {
    styleOverrides: {
      actions: {
        display: 'flex',
        gap: 8,
        marginRight: 6,
        [`& .${iconButtonClasses.root}`]: {
          minWidth: 0,
          width: 36,
          height: 36,
        },
      },
    },
  },
  MuiIcon: {
    defaultProps: {
      fontSize: 'small',
    },
    styleOverrides: {
      root: {
        variants: [
          {
            props: {
              fontSize: 'small',
            },
            style: {
              fontSize: '1rem',
            },
          },
        ],
      },
    },
  },
};

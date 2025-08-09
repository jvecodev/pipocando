import { Theme, alpha, Components } from '@mui/material/styles';
import { cremePipoca, carameloEscuro, cremeSuave, begeAreia } from '../themePrimitives';

/* eslint-disable import/prefer-default-export */
export const feedbackCustomizations: Components<Theme> = {
  MuiAlert: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: 8,
        border: '1px solid',
        borderColor: theme.palette.divider,
      }),
    },
  },
  MuiDialog: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiDialog-paper': {
          borderRadius: '10px',
          border: '1px solid',
          borderColor: theme.palette.divider,
          // Adicionando um background sutil de bege
          backgroundImage: theme.palette.mode === 'dark'            ? `linear-gradient(135deg, ${alpha(carameloEscuro, 0.95)}, ${alpha('#2A1E14', 0.9)})`
            : `linear-gradient(135deg, ${alpha(cremePipoca, 0.95)}, ${alpha(cremeSuave, 0.9)})`,
        },
      }),
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: ({ theme }) => ({
        height: 8,
        borderRadius: 8,
        backgroundColor: begeAreia,
        ...theme.applyStyles('dark', {
          backgroundColor: carameloEscuro,
        }),
      }),
    },
  },
};

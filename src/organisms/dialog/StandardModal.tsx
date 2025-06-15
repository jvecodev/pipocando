import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    backgroundImage:
      theme.palette.mode === 'dark'
        ? "radial-gradient(ellipse 80% 50% at 50% -20%, hsla(210, 100%, 16%, 0.5), transparent)"
        : "radial-gradient(ellipse 80% 50% at 50% -20%, hsla(211, 100%, 83.1%, 0.3), transparent)",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(3),
  paddingTop: theme.spacing(0),
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: theme.spacing(2, 3, 3),
}));

interface StandardModalProps {
  open: boolean;
  title?: string;
  children?: React.ReactNode;
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  hideActions?: boolean;
}

export default function StandardModal({
  open,
  title,
  children,
  onClose,
  onConfirm,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  hideActions = false,
}: StandardModalProps) {
  return (
    <StyledDialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {title && (
        <StyledDialogTitle>
          <Typography variant="h6" component="h2" fontWeight={600}>
            {title}
          </Typography>
          <IconButton
            aria-label="fechar"
            onClick={onClose}
            size="small"
            sx={{
              backgroundColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.05)',
              '&:hover': {
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255,255,255,0.1)'
                    : 'rgba(0,0,0,0.1)',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </StyledDialogTitle>
      )}
      <StyledDialogContent dividers={!!title}>
        {children}
      </StyledDialogContent>
      {!hideActions && (
        <StyledDialogActions>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: '12px',
              textTransform: 'none',
              fontWeight: 600,
              px: 3,
            }}
          >
            {cancelText}
          </Button>
          {onConfirm && (
            <Button
              onClick={onConfirm}
              variant="contained"
              color="primary"
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              {confirmText}
            </Button>
          )}
        </StyledDialogActions>
      )}
    </StyledDialog>
  );
}

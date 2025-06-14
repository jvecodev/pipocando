import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

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
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>{children}</DialogContent>
      {!hideActions && (
        <DialogActions>
          <Button onClick={onClose}>{cancelText}</Button>
          {onConfirm && (
            <Button onClick={onConfirm} variant="contained" color="primary">
              {confirmText}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
}

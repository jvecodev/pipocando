import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

interface DeleteConfirmationModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
  title?: string;
  message?: string;
}

export default function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  itemName,
  title = 'Confirmar Deleção',
  message,
}: DeleteConfirmationModalProps) {
  const dialogMessage = message || `Tem certeza que deseja deletar "${itemName || 'este item'}"? Esta ação não pode ser desfeita.`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-confirmation-dialog-title"
      aria-describedby="delete-confirmation-dialog-description"
    >
      <DialogTitle id="delete-confirmation-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="delete-confirmation-dialog-description">
          {dialogMessage}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          sx={{ color: 'white', backgroundColor: 'red', '&:hover': { backgroundColor: 'darkred' } }} 
          autoFocus
        >
          Deletar
        </Button>
      </DialogActions>
    </Dialog>
  );
}

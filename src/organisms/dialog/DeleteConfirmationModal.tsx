import React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
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
    <StyledDialog
      open={open}
      onClose={onClose}
      aria-labelledby="delete-confirmation-dialog-title"
      aria-describedby="delete-confirmation-dialog-description"
    >
      <StyledDialogTitle id="delete-confirmation-dialog-title">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <DeleteOutlineIcon color="error" />
          <Typography variant="h6" component="h2" fontWeight={600}>
            {title}
          </Typography>
        </Box>
        <IconButton 
          aria-label="fechar" 
          onClick={onClose}
          size="small"
          sx={{ 
            backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
            '&:hover': {
              backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
            }
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        <DialogContentText id="delete-confirmation-dialog-description" sx={{ mb: 2 }}>
          {dialogMessage}
        </DialogContentText>
      </StyledDialogContent>
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
          Cancelar
        </Button>
        <Button 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          sx={{ 
            borderRadius: '12px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
          }}
          startIcon={<DeleteOutlineIcon />}
        >
          Deletar
        </Button>
      </StyledDialogActions>
    </StyledDialog>
  );
}

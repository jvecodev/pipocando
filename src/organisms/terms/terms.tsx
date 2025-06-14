// Terms.tsx
import * as React from "react";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";

interface TermsProps {
  open: boolean;
  onClose: () => void;
}

export default function Terms({ open, onClose }: TermsProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: (theme) => ({
          borderRadius: 3,
          border: "1px solid",
          borderColor: theme.palette.divider,
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0 0 24px 8px hsla(220, 25%, 80%, 0.2)",
          px: { xs: 2, sm: 4 },
          py: 2,
          position: "relative",
          ...theme.applyStyles("dark", {
            backgroundColor: theme.palette.background.default,
            borderColor: theme.palette.grey[700],
            boxShadow: "0 0 32px 12px hsla(210, 100%, 25%, 0.2)",
          }),
        }),
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 8,
          top: 8,
          color: theme.palette.grey[700],
          transition: "color 0.3s ease",
          "&:hover": {
            color: theme.palette.error.main,
          },
          ...theme.applyStyles("dark", {
            color: theme.palette.grey[300],
            "&:hover": {
              color: theme.palette.error.light,
            },
          }),
        })}
      >
        <CloseIcon />
      </IconButton>

      <DialogTitle
        sx={(theme) => ({
          fontWeight: "bold",
          fontSize: "1.25rem",
          color: theme.palette.text.primary,
          textAlign: "center",
          pb: 1,
          ...theme.applyStyles("dark", {
            color: theme.palette.common.white,
          }),
        })}
      >
        Termos e Condições
      </DialogTitle>

      <DialogContent
        dividers
        sx={(theme) => ({
          color: theme.palette.text.secondary,
          fontSize: "0.95rem",
          lineHeight: 1.6,
          ...theme.applyStyles("dark", {
            color: theme.palette.grey[300],
          }),
        })}
      >
        <Typography variant="body2">
          Ao utilizar este site, você concorda com nossos termos de uso,
          política de privacidade, e outros avisos legais.
        </Typography>
      </DialogContent>
    </Dialog>
  );
}

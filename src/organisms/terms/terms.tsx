import * as React from "react";
import Typography from "@mui/material/Typography";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CloseIcon from "@mui/icons-material/Close";
import SecurityIcon from "@mui/icons-material/Security";
import InfoIcon from "@mui/icons-material/Info";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { IconButton, Button, Box, Divider, Accordion, AccordionSummary, AccordionDetails, Chip } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

interface TermsProps {
  open: boolean;
  onClose: () => void;
}

export default function Terms({ open, onClose }: TermsProps) {
  const [expanded, setExpanded] = React.useState<string | false>('panel1');

  const handleChange = (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      PaperProps={{
        sx: (theme) => ({
          borderRadius: 3,
          border: "1px solid",
          borderColor: theme.palette.divider,
          backgroundColor: theme.palette.background.paper,
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          position: "relative",
          maxHeight: "90vh",
          ...theme.applyStyles("dark", {
            backgroundColor: theme.palette.background.default,
            borderColor: theme.palette.grey[700],
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
          }),
        }),
      }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        sx={(theme) => ({
          position: "absolute",
          right: 12,
          top: 12,
          color: theme.palette.grey[600],
          transition: "all 0.3s ease",
          zIndex: 1,
          "&:hover": {
            color: theme.palette.error.main,
            backgroundColor: theme.palette.error.light + "20",
            transform: "scale(1.1)",
          },
          ...theme.applyStyles("dark", {
            color: theme.palette.grey[400],
            "&:hover": {
              color: theme.palette.error.light,
              backgroundColor: theme.palette.error.dark + "30",
            },
          }),
        })}
      >
        <CloseIcon />
      </IconButton>

      <DialogTitle
        sx={(theme) => ({
          textAlign: "center",
          pt: 4,
          pb: 2,
          px: 4,
        })}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, mb: 2 }}>
          <VerifiedUserIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography
            variant="h4"
            component="h1"
            sx={(theme) => ({
              fontWeight: 600,
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            })}
          >
            Termos e Condições
          </Typography>
        </Box>
        <Typography
          variant="subtitle1"
          sx={(theme) => ({
            color: theme.palette.text.secondary,
            fontWeight: 400,
            maxWidth: 600,
            mx: 'auto'
          })}
        >
          Conheça nossos termos de uso e políticas de privacidade para uma experiência segura
        </Typography>
      </DialogTitle>

      <DialogContent
        sx={(theme) => ({
          px: 4,
          py: 2,
          "& .MuiAccordion-root": {
            mb: 2,
            "&:before": {
              display: "none",
            },
          },
        })}
      >
        <Box sx={{ mb: 3 }}>
          <Chip
            icon={<InfoIcon />}
            label="Última atualização: 18 de junho de 2025"
            variant="outlined"
            sx={{ mb: 2 }}
          />
        </Box>

        <Accordion expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={(theme) => ({
              backgroundColor: theme.palette.primary.main + "08",
              borderRadius: 1,
              mb: 1,
              "&.Mui-expanded": {
                minHeight: 48,
              },
              "& .MuiAccordionSummary-content": {
                "&.Mui-expanded": {
                  margin: "12px 0",
                },
              },
            })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                1. Aceitação dos Termos
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              Ao acessar e usar a plataforma <strong>Pipocando</strong>, você concorda em estar vinculado a estes 
              Termos e Condições de Uso. Se você não concorda com qualquer parte destes termos, não deve usar nossos serviços.
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Estes termos podem ser atualizados periodicamente, e é sua responsabilidade revisá-los regularmente.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={(theme) => ({
              backgroundColor: theme.palette.secondary.main + "08",
              borderRadius: 1,
              mb: 1,
            })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="secondary" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                2. Uso da Plataforma
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              O <strong>Pipocando</strong> é uma plataforma para descoberta e avaliação de filmes e séries. Você pode:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Pesquisar e descobrir novos conteúdos audiovisuais
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Criar listas personalizadas de favoritos
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Compartilhar avaliações e comentários
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Interagir com outros usuários da comunidade
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel3'} onChange={handleChange('panel3')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={(theme) => ({
              backgroundColor: theme.palette.info.main + "08",
              borderRadius: 1,
              mb: 1,
            })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <VerifiedUserIcon color="info" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                3. Privacidade e Dados
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              Respeitamos sua privacidade e protegemos seus dados pessoais de acordo com a LGPD (Lei Geral de Proteção de Dados).
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              <strong>Coletamos apenas:</strong>
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Informações de cadastro (nome, email)
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Preferências de filmes e séries
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Dados de uso da plataforma para melhorias
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'panel4'} onChange={handleChange('panel4')}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={(theme) => ({
              backgroundColor: theme.palette.warning.main + "08",
              borderRadius: 1,
              mb: 1,
            })}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="warning" />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                4. Responsabilidades do Usuário
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              Ao usar nossa plataforma, você se compromete a:
            </Typography>
            <Box component="ul" sx={{ pl: 2, mb: 2 }}>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Não violar direitos autorais ou propriedade intelectual
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Manter a civilidade em comentários e interações
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Não divulgar conteúdo ofensivo ou inadequado
              </Typography>
              <Typography component="li" variant="body1" sx={{ mb: 1 }}>
                Proteger suas credenciais de acesso
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Divider sx={{ my: 3 }} />
        
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
            Para dúvidas sobre estes termos, entre em contato conosco
          </Typography>
          <Chip
            label="suporte@pipocando.com"
            variant="outlined"
            sx={{ fontWeight: 500 }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          fullWidth
          sx={(theme) => ({
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: 600,
            background: 'gray',
            "&:hover": {
              background: 'darkgray',
              transform: 'translateY(-1px)',
              boxShadow: theme.shadows[8],
            },
            transition: 'all 0.3s ease',
          })}
        >
          Entendi e Aceito
        </Button>
      </DialogActions>
    </Dialog>
  );
}

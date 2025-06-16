import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  InputAdornment,
  Paper,
  Stack,
  Chip,
} from '@mui/material';
import { 
  ExpandMore, 
  Search as SearchIcon, 
  QuestionAnswer,
  LocalMovies,
  Search,
  CheckCircle,
  Person,
  Favorite,
  AttachMoney,
  Tv,
  Movie,
  Chat,
  PhoneAndroid
} from '@mui/icons-material';
import MainLayout from '../../layout/MainLayout';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  category: string;
  icon: React.ReactNode;
}

const faqData: FAQItem[] = [  {
    id: 1,
    question: 'O que é o Pipocando?',
    answer: 'O Pipocando é uma plataforma que ajuda você a descobrir onde assistir seus filmes e séries favoritos. Utilizamos dados da API do TMDB (The Movie Database) para fornecer informações atualizadas sobre disponibilidade em diferentes plataformas de streaming, compra e aluguel.',
    category: 'geral',
    icon: <LocalMovies color="primary" />
  },
  {
    id: 2,
    question: 'Como funciona a busca por onde assistir?',
    answer: 'Integramos com a API do TMDB que fornece dados de provedores como Netflix, Amazon Prime, Disney+, Apple TV e outros. As informações são específicas para o Brasil e mostram onde cada conteúdo está disponível para streaming, compra ou aluguel.',
    category: 'funcionalidades',
    icon: <Search color="primary" />
  },
  {
    id: 3,
    question: 'As informações são sempre precisas?',
    answer: 'Fazemos o nosso melhor para manter as informações atualizadas, mas a disponibilidade de conteúdo pode mudar rapidamente nas plataformas de streaming. Recomendamos sempre verificar diretamente na plataforma antes de fazer uma compra ou se inscrever em um serviço.',
    category: 'precisão',
    icon: <CheckCircle color="primary" />
  },
  {
    id: 4,
    question: 'Preciso criar uma conta para usar o Pipocando?',
    answer: 'Não, você pode navegar e buscar filmes e séries sem criar uma conta. No entanto, criar uma conta permite salvar seus favoritos e ter uma experiência mais personalizada.',
    category: 'conta',
    icon: <Person color="primary" />
  },
  {
    id: 5,
    question: 'Como posso salvar meus filmes e séries favoritos?',
    answer: 'Após criar uma conta e fazer login, você verá um ícone de coração em cada filme/série. Clique nele para adicionar ou remover dos seus favoritos. Seus favoritos ficam salvos e você pode acessá-los a qualquer momento.',
    category: 'favoritos',
    icon: <Favorite color="primary" />
  },
  {
    id: 6,
    question: 'Vocês cobram alguma taxa para usar a plataforma?',
    answer: 'Não, o Pipocando é completamente gratuito. Não cobramos nenhuma taxa para usar nossa plataforma de busca e descoberta de conteúdo.',
    category: 'pagamento',
    icon: <AttachMoney color="primary" />
  },
  {
    id: 7,
    question: 'Quais plataformas de streaming vocês monitoram?',
    answer: 'Monitoramos as principais plataformas disponíveis no Brasil, incluindo Netflix, Amazon Prime Video, Disney+, Globoplay, Apple TV+, HBO Max, Paramount+, Pluto TV, e muitas outras. A lista é atualizada conforme novas plataformas se tornam disponíveis.',
    category: 'plataformas',
    icon: <Tv color="primary" />
  },
  {
    id: 8,
    question: 'Como vocês obtêm as informações sobre filmes e séries?',
    answer: 'Utilizamos a API oficial do TMDB (The Movie Database), que é uma das maiores bases de dados de filmes e séries do mundo. Esta API nos fornece informações detalhadas sobre elenco, sinopse, avaliações e disponibilidade em diferentes plataformas.',
    category: 'dados',
    icon: <Movie color="primary" />
  },
  {
    id: 9,
    question: 'Posso sugerir novos recursos ou reportar problemas?',
    answer: 'Sim! Valorizamos muito o feedback dos nossos usuários. Entre em contato conosco através do email contato@pipocando.com.br para sugerir novos recursos, reportar bugs ou enviar qualquer feedback.',
    category: 'feedback',
    icon: <Chat color="primary" />
  },
  {
    id: 10,
    question: 'Vocês têm aplicativo móvel?',
    answer: 'Atualmente somos uma aplicação web responsiva que funciona bem em dispositivos móveis. Estamos considerando desenvolver aplicativos nativos para iOS e Android no futuro.',
    category: 'mobile',
    icon: <PhoneAndroid color="primary" />
  }
];

const FAQ: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expanded, setExpanded] = useState<number | false>(false);

  const handleChange = (panel: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded ? panel : false);
  };

  const filteredFAQ = faqData.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const categories = Array.from(new Set(faqData.map(item => item.category)));

  return (
    <MainLayout>
      {/* Hero Section */}
      <Box sx={{ textAlign: 'left', mb: 6, mt: { xs: 6, md: 12 } }}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            fontSize: { xs: '2.5rem', md: '4rem' },
            color: 'text.primary',
          }}
        >
          Perguntas Frequentes
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{ fontWeight: 500, maxWidth: 800, mb: 4 }}
        >
          Encontre respostas para as dúvidas mais comuns sobre o Pipocando.
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', mb: 2 }}>
          {/* Botões podem ser personalizados conforme necessidade */}
        </Box>
      </Box>

      {/* Search Section */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <TextField
          fullWidth
          placeholder="Buscar nas perguntas frequentes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ 
            maxWidth: 500,
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
              backgroundColor: 'background.paper',
            }
          }}
        />
      </Box>

      {/* Categories */}
      {!searchQuery && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom align="center" color="text.secondary">
            Categorias
          </Typography>
          <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" useFlexGap>
            {categories.map((category) => (
              <Chip
                key={category}
                label={category.charAt(0).toUpperCase() + category.slice(1)}
                variant="outlined"
                onClick={() => setSearchQuery(category)}
                sx={{ 
                  textTransform: 'capitalize',
                  borderRadius: 3,
                  '&:hover': { backgroundColor: 'primary.light', color: 'white' }
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      {/* FAQ Content */}
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {filteredFAQ.length === 0 ? (
          <Box textAlign="center" py={8}>
            <QuestionAnswer sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom>
              Nenhuma pergunta encontrada
            </Typography>
            <Typography color="text.secondary">
              Tente uma busca diferente para "{searchQuery}"
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {filteredFAQ.map((item) => (
              <Accordion
                key={item.id}
                expanded={expanded === item.id}
                onChange={handleChange(item.id)}
                sx={{
                  '&:before': {
                    display: 'none',
                  },
                  boxShadow: 2,
                  borderRadius: 3,
                  overflow: 'hidden',
                  '&.Mui-expanded': {
                    boxShadow: 4,
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  sx={{
                    backgroundColor: 'background.paper',
                    minHeight: 64,
                    '&.Mui-expanded': {
                      minHeight: 64,
                    },
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center',
                    },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography sx={{ fontSize: '1.5rem' }}>
                      {item.icon}
                    </Typography>
                    <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
                      {item.question}
                    </Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    backgroundColor: 'background.default',
                    p: 3,
                  }}
                >
                  <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
                    {item.answer}
                  </Typography>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        )}
      </Box>

      {/* Contact Section */}
      <Paper
        elevation={3}
        sx={{ 
          mt: 8, 
          p: 4, 
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(156, 39, 176, 0.1) 100%)',
          textAlign: 'center',
          maxWidth: 600,
          mx: 'auto'
        }}
      >
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
          💌 Não encontrou sua resposta?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Nossa equipe está sempre pronta para ajudar! Entre em contato conosco e teremos prazer em esclarecer suas dúvidas.
        </Typography>
        <Box
          component="a"
          href="mailto:contato@pipocando.com.br"
          sx={{
            display: 'inline-block',
            textDecoration: 'none',
            color: 'primary.main',
            fontWeight: 'bold',
            fontSize: '1.1rem',
            '&:hover': {
              textDecoration: 'underline',
            },
          }}
        >
          📧 contato@pipocando.com.br
        </Box>
      </Paper>
    </MainLayout>
  );
};

export default FAQ;

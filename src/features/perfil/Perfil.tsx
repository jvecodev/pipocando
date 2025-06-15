import React, { useState, useEffect, useContext } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import {
    Typography,
    Box,
    TextField,
    Button,
    Paper,
    Snackbar,
    Alert,
    CircularProgress,
    Container,
    FormControl,
    FormLabel,
    Card,
    CardContent,
    Divider,
    Stack,
    Chip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../../services/userService';
import AppTheme from '../../shared-theme/AppTheme';
import Header from '../../organisms/header/Header';
import { styled } from '@mui/material/styles';

// Modificamos a interface para incluir perfil
interface ProfileData {
    id: string | number | ''; // Aceita string, number ou string vazia
    name: string;
    email: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

// Styled card similar ao BlogCard
const StyledCard = styled(Card)<{ component?: React.ElementType }>(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    padding: 0,
    height: '100%',
    backgroundColor: theme.palette.background.paper,
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: 'rgba(0, 0, 0, 0.04) 0px 5px 22px, rgba(0, 0, 0, 0.03) 0px 0px 0px 0.5px',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        boxShadow: 'rgba(0, 0, 0, 0.09) 0px 8px 30px, rgba(0, 0, 0, 0.06) 0px 0px 0px 1px',
        transform: 'translateY(-2px)'
    }
}));

// Estilizar o cabeçalho da seção
const SectionHeader = styled(Box)(({ theme }) => ({
    position: 'relative',
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    borderBottom: `1px solid ${theme.palette.divider}`
}));

export default function Perfil(props: { disableCustomTheme?: boolean }) {
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [passwordValid, setPasswordValid] = useState(false);

    const [formData, setFormData] = useState<ProfileData>({
        id: 0,
        name: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Form validation errors
    const [nameError, setNameError] = useState(false);
    const [nameErrorMessage, setNameErrorMessage] = useState('');
    const [emailError, setEmailError] = useState(false);
    const [emailErrorMessage, setEmailErrorMessage] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [passwordErrorMessage, setPasswordErrorMessage] = useState('');
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);
    const [confirmPasswordErrorMessage, setConfirmPasswordErrorMessage] = useState('');

    useEffect(() => {
        console.log("UserContext data:", user);
        
        // Redirecionar se não estiver autenticado
        if (!user) {
            navigate('/login');
            return;
        }

        // Preencher dados do usuário, garantindo que ID não é undefined
        setFormData({
            id: user.id ?? '', // Usando o operador de coalescência nula para fornecer um valor padrão
            name: user.name || '',
            email: user.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    }, [user, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        // Validações separadas que não afetam o estado principal do formulário
        if (name === 'name') {
            if (/\d/.test(value)) {
                setNameError(true);
                setNameErrorMessage('Caracter inválido.');
            } else {
                setNameError(false);
                setNameErrorMessage('');
            }
        } else if (name === 'email') {
            setEmailError(false);
            setEmailErrorMessage('');
        } else if (name === 'newPassword') {
            setPasswordValid(value.length >= 6);
            setPasswordError(false);
            setPasswordErrorMessage('');
        } else if (name === 'currentPassword') {
            setPasswordError(false);
            setPasswordErrorMessage('');
        } else if (name === 'confirmPassword') {
            setConfirmPasswordError(false);
            setConfirmPasswordErrorMessage('');
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;

        // Validar nome
        if (!formData.name || formData.name.length < 4 || !/^[A-Za-zÀ-ÖØ-öø-ÿ]+ [A-Za-zÀ-ÖØ-öø-ÿ]+$/.test(formData.name)) {
            setNameError(true);
            setNameErrorMessage('O nome deve conter apenas letras e pelo menos um espaço.');
            isValid = false;
        }

        // Validar email
        if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
            setEmailError(true);
            setEmailErrorMessage('Por favor, insira um email válido.');
            isValid = false;
        }

        // Validar senha (apenas se o usuário estiver tentando mudar a senha)
        if (formData.newPassword) {
            if (formData.newPassword.length < 6 || /\s/.test(formData.newPassword)) {
                setPasswordError(true);
                setPasswordErrorMessage('A nova senha precisa ter no mínimo 6 caracteres e não pode conter espaços.');
                isValid = false;
            }

            if (!formData.currentPassword) {
                setPasswordError(true);
                setPasswordErrorMessage('A senha atual é necessária para definir uma nova senha.');
                isValid = false;
            }

            if (formData.newPassword !== formData.confirmPassword) {
                setConfirmPasswordError(true);
                setConfirmPasswordErrorMessage('As senhas não conferem.');
                isValid = false;
            }
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const dataToUpdate = {
                id: user?.id ? Number(user.id) : 0, // Ensure id is a number
                name: formData.name,
                email: formData.email,
                currentPassword: formData.currentPassword || undefined,
                newPassword: formData.newPassword || undefined
            };

            // Remover campos indefinidos
            Object.keys(dataToUpdate).forEach(key => {
                if (dataToUpdate[key as keyof typeof dataToUpdate] === undefined) {
                    delete dataToUpdate[key as keyof typeof dataToUpdate];
                }
            });

            const response = await updateUserProfile(dataToUpdate);

            // Atualizar contexto do usuário com novos dados
            if (user) {
                setUser({
                    ...user,
                    name: response.name || user.name,
                    email: response.email || user.email
                });
                
                // Update localStorage
                const updatedUserData = {
                    ...user,
                    name: formData.name,
                    email: formData.email,
                };
                localStorage.setItem('user', JSON.stringify(updatedUserData));
            }

            setSuccess(true);

            // Limpar campos de senha após atualização
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }));
        } catch (error: any) {
            setError(error.message || "Ocorreu um erro ao atualizar o perfil");
        } finally {
            setLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSuccess(false);
        setError("");
    };

    return (
        <AppTheme {...props}>
            <CssBaseline enableColorScheme />
            <Header />
            <Box
                sx={(theme) => ({
                    pt: { xs: 14, sm: 20 },
                    pb: { xs: 8, sm: 16 },
                    width: "100%",
                    backgroundRepeat: "no-repeat",
                    backgroundImage:
                        "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(211, 100.00%, 83.10%), transparent)",
                    ...theme.applyStyles("dark", {
                        backgroundImage:
                            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 16%), transparent)",
                    }),
                })}
            >
                <Container maxWidth="md">
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4
                    }}>
                        <Box sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2
                        }}>
                            <div>
                                <Typography variant="h1" gutterBottom>
                                    Meu Perfil
                                </Typography>
                                <Typography>Atualize suas informações pessoais e preferências de conta</Typography>
                            </div>
                            <Box
                                sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    px: 2,
                                    py: 1,
                                    bgcolor: 'action.selected',
                                    '&:hover': {
                                        bgcolor: 'action.hover',
                                    },
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <AccountCircleIcon
                                    fontSize="small"
                                    sx={{
                                        mr: 1,
                                        color: 'text.primary'
                                    }}
                                />
                                <Typography
                                    component="span"
                                    variant="body1"
                                    color="text.primary"
                                >
                                    {user?.perfil === 'ADMIN' ? 'Administrador' : 'Usuário'}
                                    {/* Alternative way if using role property */}
                                    {/* {user?.role === 'ADMIN' ? 'Administrador' : 'Usuário'} */}
                                </Typography>
                            </Box>
                        </Box>

                        {/* Informações pessoais */}
                        <Box component="form" onSubmit={handleSubmit} noValidate>
                            <StyledCard>
                                <SectionHeader>
                                    <PersonIcon color="primary" />
                                    <Typography variant="h6" fontWeight="500">
                                        Informações Pessoais
                                    </Typography>
                                </SectionHeader>

                                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                    <Stack spacing={3} sx={{ mb: 2 }}>
                                        <FormControl>
                                            <FormLabel htmlFor="name" sx={{ mb: 1, fontWeight: 500 }}>
                                                Nome completo
                                            </FormLabel>
                                            <TextField
                                                required
                                                fullWidth
                                                id="name"
                                                name="name"
                                                placeholder="Fulano da Silva"
                                                autoComplete="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                error={nameError}
                                                helperText={nameError ? nameErrorMessage : ''}
                                                color={nameError ? 'error' : 'primary'}
                                                InputProps={{
                                                    inputProps: {
                                                        autoFocus: true
                                                    },
                                                    sx: {
                                                        borderRadius: 1.5
                                                    }
                                                }}
                                            />
                                        </FormControl>

                                        <FormControl>
                                            <FormLabel htmlFor="email" sx={{ mb: 1, fontWeight: 500 }}>
                                                Email
                                            </FormLabel>
                                            <TextField
                                                required
                                                fullWidth
                                                id="email"
                                                name="email"
                                                placeholder="seu.email@email.com"
                                                autoComplete="email"
                                                variant="outlined"
                                                value={formData.email}
                                                onChange={handleChange}
                                                error={emailError}
                                                helperText={emailError ? emailErrorMessage : ''}
                                                color={emailError ? 'error' : 'primary'}
                                                InputProps={{
                                                    sx: {
                                                        borderRadius: 1.5
                                                    }
                                                }}
                                            />
                                        </FormControl>
                                    </Stack>
                                </CardContent>
                            </StyledCard>

                            {/* Segurança */}
                            <StyledCard sx={{ mt: 4 }}>
                                <SectionHeader>
                                    <SecurityIcon color="primary" />
                                    <Typography variant="h6" fontWeight="500">
                                        Segurança
                                    </Typography>
                                </SectionHeader>

                                <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                                    <Stack spacing={3} sx={{ mb: 2 }}>
                                        <Box>
                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                Para alterar sua senha, preencha os campos abaixo com sua senha atual e a nova senha desejada.
                                            </Typography>
                                            <Divider />
                                        </Box>

                                        <FormControl>
                                            <FormLabel htmlFor="currentPassword" sx={{ mb: 1, fontWeight: 500 }}>
                                                Senha Atual
                                            </FormLabel>
                                            <TextField
                                                fullWidth
                                                name="currentPassword"
                                                placeholder="••••••"
                                                type="password"
                                                id="currentPassword"
                                                autoComplete="current-password"
                                                value={formData.currentPassword}
                                                onChange={handleChange}
                                                error={passwordError}
                                                helperText={passwordError ? passwordErrorMessage : ''}
                                                color={passwordError ? 'error' : 'primary'}
                                                InputProps={{
                                                    sx: {
                                                        borderRadius: 1.5,
                                                        maxWidth: '300px'
                                                    }
                                                }}
                                            />
                                        </FormControl>

                                        <Box sx={{
                                            display: 'flex',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: 2
                                        }}>
                                            <FormControl sx={{ flex: 1 }}>
                                                <FormLabel htmlFor="newPassword" sx={{ mb: 1, fontWeight: 500 }}>
                                                    Nova Senha
                                                </FormLabel>
                                                <TextField
                                                    fullWidth
                                                    name="newPassword"
                                                    placeholder="••••••"
                                                    type="password"
                                                    id="newPassword"
                                                    autoComplete="new-password"
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    InputProps={{
                                                        sx: {
                                                            borderRadius: 1.5
                                                        }
                                                    }}
                                                />
                                                {formData.newPassword && (
                                                    <Box
                                                        sx={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            marginTop: '0.5rem',
                                                            color: passwordValid ? 'success.main' : 'text.secondary',
                                                        }}
                                                    >
                                                        <Typography variant="body2" sx={{ flexGrow: 1, fontSize: '0.75rem' }}>
                                                            • Mínimo 6 caracteres
                                                        </Typography>
                                                        {passwordValid && <CheckIcon fontSize="small" />}
                                                    </Box>
                                                )}
                                            </FormControl>

                                            <FormControl sx={{ flex: 1 }}>
                                                <FormLabel htmlFor="confirmPassword" sx={{ mb: 1, fontWeight: 500 }}>
                                                    Confirmar Nova Senha
                                                </FormLabel>
                                                <TextField
                                                    fullWidth
                                                    name="confirmPassword"
                                                    placeholder="••••••"
                                                    type="password"
                                                    id="confirmPassword"
                                                    autoComplete="new-password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleChange}
                                                    error={confirmPasswordError}
                                                    helperText={confirmPasswordError ? confirmPasswordErrorMessage : ''}
                                                    color={confirmPasswordError ? 'error' : 'primary'}
                                                    InputProps={{
                                                        sx: {
                                                            borderRadius: 1.5
                                                        }
                                                    }}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </StyledCard>

                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    mt: 4,
                                    mb: 2
                                }}
                            >
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    disabled={loading}
                                    startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
                                    sx={{
                                        py: 1.5,
                                        px: 4,
                                        borderRadius: 2,
                                        '&:hover': {
                                            backgroundColor: 'hsl(49, 72.90%, 65.30%)'
                                        }
                                    }}
                                >
                                    {loading ? 'Salvando alterações...' : 'Salvar alterações'}
                                </Button>
                            </Box>
                        </Box>

                        {/* Notificações */}
                        <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                            <Alert
                                onClose={handleCloseSnackbar}
                                severity="success"
                                sx={{
                                    width: '100%',
                                    boxShadow: 2,
                                    borderRadius: 2
                                }}
                                variant="filled"
                            >
                                Perfil atualizado com sucesso!
                            </Alert>
                        </Snackbar>

                        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                            <Alert
                                onClose={handleCloseSnackbar}
                                severity="error"
                                sx={{
                                    width: '100%',
                                    boxShadow: 2,
                                    borderRadius: 2
                                }}
                                variant="filled"
                            >
                                {error}
                            </Alert>
                        </Snackbar>
                    </Box>
                </Container>
            </Box>
        </AppTheme>
    );
}
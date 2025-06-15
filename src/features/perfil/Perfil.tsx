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
    Chip,
    Modal,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckIcon from '@mui/icons-material/Check';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SecurityIcon from '@mui/icons-material/Security';
import EmailIcon from '@mui/icons-material/Email';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import { UserContext } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, deleteUserAccount } from '../../services/userService';
import AppTheme from '../../shared-theme/AppTheme';
import Header from '../../organisms/header/Header';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { ProfileUpdateData } from '../../services/userService';

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
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState(""); 
    const [passwordValid, setPasswordValid] = useState(false);
    
    // Estado para controlar o modal de exclusão de conta
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState('');
    const [confirmEmailError, setConfirmEmailError] = useState(false);
    const [confirmEmailErrorMessage, setConfirmEmailErrorMessage] = useState('');

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
            
            // Check if confirmPassword already has a value and update confirmation validation
            if (formData.confirmPassword) {
                if (value !== formData.confirmPassword) {
                    setConfirmPasswordError(true);
                    setConfirmPasswordErrorMessage('As senhas não conferem.');
                } else {
                    setConfirmPasswordError(false);
                    setConfirmPasswordErrorMessage('');
                }
            }
        } else if (name === 'currentPassword') {
            setPasswordError(false);
            setPasswordErrorMessage('');
        } else if (name === 'confirmPassword') {
            if (formData.newPassword && value !== formData.newPassword) {
                setConfirmPasswordError(true);
                setConfirmPasswordErrorMessage('As senhas não conferem.');
            } else {
                setConfirmPasswordError(false);
                setConfirmPasswordErrorMessage('');
            }
        }
    };

    const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfirmEmail(e.target.value);
        
        // Limpa o erro quando o usuário começa a digitar novamente
        if (confirmEmailError) {
            setConfirmEmailError(false);
            setConfirmEmailErrorMessage('');
        }
    };

    const validateForm = (): boolean => {
        let isValid = true;

        // Reset previous errors
        setNameError(false);
        setNameErrorMessage('');
        setEmailError(false);
        setEmailErrorMessage('');
        setPasswordError(false);
        setPasswordErrorMessage('');
        setConfirmPasswordError(false);
        setConfirmPasswordErrorMessage('');

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

        // Verificar se os campos de senha estão sendo usados
        const isChangingPassword = formData.currentPassword || formData.newPassword || formData.confirmPassword;

        if (isChangingPassword) {
            // Validar senha atual
            if (!formData.currentPassword) {
                setPasswordError(true);
                setPasswordErrorMessage('A senha atual é necessária para alterar sua senha.');
                isValid = false;
            }

            // Validar nova senha
            if (!formData.newPassword) {
                setPasswordError(true);
                setPasswordErrorMessage('Por favor, preencha a nova senha.');
                isValid = false;
            } else if (formData.newPassword.length < 6 || /\s/.test(formData.newPassword)) {
                setPasswordError(true);
                setPasswordErrorMessage('A nova senha precisa ter no mínimo 6 caracteres e não pode conter espaços.');
                isValid = false;
            }

            // Validar confirmação da nova senha
            if (!formData.confirmPassword) {
                setConfirmPasswordError(true);
                setConfirmPasswordErrorMessage('Por favor, confirme sua nova senha.');
                isValid = false;
            } else if (formData.newPassword !== formData.confirmPassword) {
                setConfirmPasswordError(true);
                setConfirmPasswordErrorMessage('As senhas não conferem.');
                isValid = false;
            }
        } else {
            // Se não estiver tentando mudar a senha, verificar que todos os campos de senha estão vazios
            if (formData.currentPassword || formData.newPassword || formData.confirmPassword) {
                // Se algum campo de senha estiver preenchido, verificar se todos os outros necessários estão
                if (!formData.currentPassword) {
                    setPasswordError(true);
                    setPasswordErrorMessage('A senha atual é necessária para alterar sua senha.');
                    isValid = false;
                }
                
                if (!formData.newPassword) {
                    setPasswordError(true);
                    setPasswordErrorMessage('Por favor, preencha a nova senha.');
                    isValid = false;
                }
                
                if (!formData.confirmPassword) {
                    setConfirmPasswordError(true);
                    setConfirmPasswordErrorMessage('Por favor, confirme sua nova senha.');
                    isValid = false;
                }
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
                id: user?.id ? Number(user.id) : 0,
                name: formData.name,
                email: formData.email,
                currentPassword: formData.currentPassword || undefined,
                newPassword: formData.newPassword || undefined
            };

            // Remove undefined fields and empty strings
            Object.keys(dataToUpdate).forEach(key => {
                const value = dataToUpdate[key as keyof typeof dataToUpdate];
                if (value === undefined || (typeof value === 'string' && value.trim() === '')) {
                    delete dataToUpdate[key as keyof typeof dataToUpdate];
                }
            });

            try {
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
                        name: response.name || user.name,
                        email: response.email || user.email,
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

                // Mensagem de sucesso
                setSuccessMessage("Perfil atualizado com sucesso!");
            } catch (error: any) {
                console.error("Erro ao atualizar perfil:", error);
                
                // Verificar erro específico de senha atual inválida
                if (error.message.includes("Senha atual inválida") ||
                    error.message.includes("Invalid request") ||
                    error.message.toLowerCase().includes("current password")) {
                
                    setPasswordError(true);
                    setPasswordErrorMessage("Senha atual inválida");
                    
                    // Exibir alerta mais visível
                    setError("Senha atual inválida. Por favor, verifique e tente novamente.");
                    
                    // Limpa apenas a senha atual para nova tentativa, preservando os outros campos
                    setFormData(prev => ({
                        ...prev,
                        currentPassword: ''
                    }));
                } else {
                    setError(error.message || "Ocorreu um erro ao atualizar o perfil");
                }
            } finally {
                setLoading(false);
            }
        } catch (error: any) {
            console.error("Erro geral:", error);
            setError("Ocorreu um erro inesperado. Por favor, tente novamente.");
        } finally {
            setLoading(false);
        }
    };
    
    const handleDeleteAccount = async () => {
        // Validar se o email digitado corresponde ao email do usuário
        if (confirmEmail !== user?.email) {
            setConfirmEmailError(true);
            setConfirmEmailErrorMessage("O email informado não corresponde ao seu email. Tente novamente.");
            return;
        }

        setDeleteLoading(true);

        try {
            // Usar a função de serviço em vez de chamar axios diretamente
            await deleteUserAccount(user?.id ? Number(user.id) : 0);
            
            // Limpar dados de sessão
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userName');
            localStorage.removeItem('userRole');
            localStorage.removeItem('user');
            
            // Limpar contexto do usuário
            setUser(null);
            
            // Fechar o modal
            setDeleteModalOpen(false);
            
            // Redirecionar para a página inicial com mensagem de confirmação
            navigate('/?accountDeleted=true');
        } catch (error: any) {
            console.error("Erro ao excluir conta:", error);
            setError(error.message || "Ocorreu um erro ao tentar excluir sua conta. Por favor, tente novamente.");
        } finally {
            setDeleteLoading(false);
        }
    };

    const openDeleteModal = () => {
        setDeleteModalOpen(true);
        setConfirmEmail('');
        setConfirmEmailError(false);
        setConfirmEmailErrorMessage('');
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
                                                        borderRadius: 1.5
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
                                                    color={formData.confirmPassword && formData.newPassword && formData.confirmPassword === formData.newPassword ? 'success' : (confirmPasswordError ? 'error' : 'primary')}
                                                    InputProps={{
                                                        sx: {
                                                            borderRadius: 1.5
                                                        },
                                                        endAdornment: formData.confirmPassword && formData.newPassword && formData.confirmPassword === formData.newPassword ? (
                                                            <CheckIcon color="success" />
                                                        ) : null
                                                    }}
                                                />
                                            </FormControl>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </StyledCard>

                            {/* Botões de ação */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'center',
                                    gap: 2,
                                    mt: 4,
                                    mb: 2,
                                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
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
                                        },
                                        flex: { xs: '1 1 100%', sm: '1 1 auto' }
                                    }}
                                >
                                    {loading ? 'Salvando alterações...' : 'Salvar alterações'}
                                </Button>
                                
                                {/* Botão de deletar conta */}
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="large"
                                    onClick={openDeleteModal}
                                    startIcon={<DeleteIcon />}
                                    sx={{
                                        py: 1.5,
                                        px: 4,
                                        borderRadius: 2,
                                        borderColor: 'error.main',
                                        color: 'error.main',
                                        '&:hover': {
                                            backgroundColor: 'error.light',
                                            borderColor: 'error.dark',
                                            color: 'error.contrastText'
                                        },
                                        flex: { xs: '1 1 100%', sm: '1 1 auto' }
                                    }}
                                >
                                    Deletar conta
                                </Button>
                            </Box>
                        </Box>

                        {/* Modal de confirmação de exclusão de conta */}
                        <Dialog
                            open={deleteModalOpen}
                            onClose={() => setDeleteModalOpen(false)}
                            aria-labelledby="delete-account-dialog-title"
                            aria-describedby="delete-account-dialog-description"
                            PaperProps={{
                                sx: {
                                    borderRadius: 3,
                                    maxWidth: 500
                                }
                            }}
                        >
                            <DialogTitle id="delete-account-dialog-title" sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                color: 'error.main'
                            }}>
                                <WarningIcon color="error" />
                                Excluir conta permanentemente
                            </DialogTitle>
                            <DialogContent>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <DialogContentText id="delete-account-dialog-description" sx={{ mb: 3 }}>
                                        Esta ação <strong>não poderá ser desfeita</strong>. Todos os seus dados, incluindo histórico de atividades e preferências, serão excluídos permanentemente do nosso sistema.
                                    </DialogContentText>
                                    
                                    <DialogContentText sx={{ mb: 2 }}>
                                        Por favor, digite seu email atual <strong>({user?.email})</strong> para confirmar que deseja excluir sua conta:
                                    </DialogContentText>
                                    
                                    <TextField
                                        autoFocus
                                        fullWidth
                                        variant="outlined"
                                        placeholder="seu.email@email.com"
                                        value={confirmEmail}
                                        onChange={handleConfirmEmailChange}
                                        error={confirmEmailError}
                                        helperText={confirmEmailError ? confirmEmailErrorMessage : ''}
                                        InputProps={{
                                            sx: { borderRadius: 1.5 }
                                        }}
                                        sx={{ mb: 1 }}
                                    />
                                </Box>
                            </DialogContent>
                            <DialogActions sx={{ px: 3, pb: 3 }}>
                                <Button 
                                    onClick={() => setDeleteModalOpen(false)} 
                                    variant="text"
                                    sx={{ borderRadius: 2 }}
                                >
                                    Cancelar
                                </Button>
                                <Button 
                                    onClick={handleDeleteAccount} 
                                    variant="contained"
                                    color="error"
                                    disabled={confirmEmail !== user?.email || deleteLoading}
                                    startIcon={deleteLoading ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {deleteLoading ? 'Excluindo...' : 'Confirmar exclusão'}
                                </Button>
                            </DialogActions>
                        </Dialog>

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
                                {successMessage || "Perfil atualizado com sucesso!"}
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
import React, { useState, useEffect, useCallback } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Tooltip
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SecurityIcon from '@mui/icons-material/Security';
import PersonIcon from '@mui/icons-material/Person';
import WarningIcon from '@mui/icons-material/Warning';
import GroupIcon from '@mui/icons-material/Group';
import { useUser } from '../../context/UserContext';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, deleteUserAccount, getAllUsers, updateUser, deleteUserAdmin } from '../../services/userService';
import AppTheme from '../../shared-theme/AppTheme';
import Header from '../../organisms/header/Header';
import { styled } from '@mui/material/styles';
import { PerfilTypeEnum } from '../../types/PerfilType';
import AlertTitle from '@mui/material/Alert';
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

// Interface para os usuários na tabela
interface UserTableData {
    id: number;
    name: string;
    email: string;
    perfil: string;
    active: boolean;
}

// Interface para o modal de edição de usuário
interface UserEditData {
    id: number;
    name: string;
    email: string;
    perfil: string;
    active: boolean;
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
    const { user, setUser } = useUser();
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

    // Estados para a tabela de usuários (apenas para ADMIN)
    const [users, setUsers] = useState<UserTableData[]>([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [usersError, setUsersError] = useState('');

    // Estados para o modal de confirmação de exclusão de usuário
    const [deleteUserModalOpen, setDeleteUserModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserTableData | null>(null);
    const [deletingUser, setDeletingUser] = useState(false);

    // Estados para o modal de edição de usuário
    const [editUserModalOpen, setEditUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserEditData | null>(null);
    const [savingUser, setSavingUser] = useState(false);

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

    const [userManagementSuccess, setUserManagementSuccess] = useState(false);
    const [userManagementError, setUserManagementError] = useState("");
    const [userManagementSuccessMessage, setUserManagementSuccessMessage] = useState("");

    // Função fetchUsers modificada para normalizar os valores de perfil com useCallback
    const fetchUsers = useCallback(async () => {
        if (user?.perfil !== PerfilTypeEnum.ADMIN) return;

        setUsersLoading(true);
        setUsersError('');

        try {
            const usersData = await getAllUsers();
            // Ajustar os dados para garantir que o perfil seja mapeado corretamente
            const formattedUsers = usersData.map((user: any) => ({
                id: user.id,
                name: user.name,
                email: user.email,
                // Mapear o campo 'role' ou 'perfil' e normalizar para maiúsculas
                perfil: (user.role || user.perfil || '').toUpperCase(),
                active: user.active
            }));
            setUsers(formattedUsers);
        } catch (error: any) {
            console.error("Erro ao carregar usuários:", error);
            setUsersError(error.message || "Não foi possível carregar a lista de usuários.");
        } finally {
            setUsersLoading(false);
        }
    }, [user]);

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

        // Carregar lista de usuários se for ADMIN
        if (user.perfil === PerfilTypeEnum.ADMIN) {
            fetchUsers();
        }
    }, [user, navigate, fetchUsers]);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

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

        // Verificar se o nome está sendo alterado
        const isChangingName = user && formData.name !== user.name;

        // Se estiver alterando o nome, mostrar um alerta de confirmaçã

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            // Preparar dados para atualização
            const dataToUpdate: ProfileUpdateData = {
                id: Number(user?.id),
                name: formData.name,
                email: formData.email,
            };

            // Adicionar senha apenas se estiver sendo alterada
            const isChangingPassword = formData.currentPassword && formData.newPassword;
            if (isChangingPassword) {
                dataToUpdate.currentPassword = formData.currentPassword;
                dataToUpdate.newPassword = formData.newPassword;
            }

            // Enviar para API
            const response = await updateUserProfile(dataToUpdate);

            // Preparar mensagem de sucesso para redirecionar
            let successMessage = isChangingPassword
                ? "Senha atualizada com sucesso!"
                : "Informações pessoais atualizadas com sucesso!";

            if (isChangingName) {
                // Limpar dados de autenticação
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('userRole');
                localStorage.removeItem('user');

                // Limpar contexto do usuário
                setUser(null);

                // Redirecionar para login com mensagem de sucesso
                navigate('/login?message=' + encodeURIComponent(
                    "Seu nome foi atualizado com sucesso! Por favor, faça login novamente."
                ));
            } else {
                // Para atualizações que não alteram o nome
                // Preservar informações de autenticação atuais
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                const userRole = localStorage.getItem('userRole');

                // Atualizar o contexto do usuário
                if (user) {
                    const updatedUser = {
                        ...user,
                        name: response.name || user.name,
                        email: response.email || user.email
                    };

                    // Atualizar o contexto do usuário
                    setUser(updatedUser);

                    // Atualizar localStorage com o usuário atualizado
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    localStorage.setItem('userName', updatedUser.name);
                }

                // Restaurar dados de autenticação
                if (token) localStorage.setItem('token', token);
                if (userId) localStorage.setItem('userId', userId);
                if (userRole) localStorage.setItem('userRole', userRole);

                setSuccess(true);

                // Limpar campos de senha após atualização
                if (isChangingPassword) {
                    setFormData(prev => ({
                        ...prev,
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: ''
                    }));
                }

                setSuccessMessage(successMessage);
            }
        } catch (error: any) {
            console.error("Erro ao atualizar perfil:", error);

            // Verificar erro específico de senha atual inválida
            if (error.message.includes("Senha atual inválida") ||
                error.message.includes("Invalid request") ||
                error.message.toLowerCase().includes("current password")) {

                setPasswordError(true);
                setPasswordErrorMessage("Senha atual inválida");
                setError("Senha atual inválida. Por favor, verifique e tente novamente.");

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

    // Manipuladores para o modal de edição
    const handleOpenEditModal = (user: UserTableData) => {
        setUserToEdit({
            id: user.id,
            name: user.name,
            email: user.email,
            perfil: user.perfil,
            active: user.active
        });
        setEditUserModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setEditUserModalOpen(false);
        setUserToEdit(null);
        setSavingUser(false);
    };

    const handleEditUserChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
        const { name, value } = e.target;
        if (name && userToEdit) {
            setUserToEdit({
                ...userToEdit,
                [name]: value
            });
        }
    };

    const handleSaveUser = async () => {
        if (!userToEdit) return;

        setSavingUser(true);
        try {
            // Preparar os dados para envio
            const userData = {
                name: userToEdit.name,
                email: userToEdit.email,
                role: userToEdit.perfil, // Alterado para role
                active: userToEdit.active
            };

            // Log para diagnóstico
            console.log(`Enviando atualização para usuário ${userToEdit.id}:`, userData);

            // Enviar solicitação para atualizar o usuário
            const updatedUserData = await updateUser(userToEdit.id, userData);

            // Atualizar a lista de usuários localmente sem precisar fazer nova chamada à API
            setUsers(currentUsers =>
                currentUsers.map(u =>
                    u.id === userToEdit.id
                        ? {
                            ...u,
                            name: updatedUserData.name || u.name,
                            email: updatedUserData.email || u.email,
                            perfil: (updatedUserData.role || updatedUserData.perfil || '').toUpperCase(),
                            active: updatedUserData.active !== undefined ? updatedUserData.active : u.active
                        }
                        : u
                )
            );

            // Se o usuário que está sendo editado é o mesmo que está logado, atualizar também o contexto
            if (user && Number(user.id) === userToEdit.id) {
                // Preservar token e outras informações importantes
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');
                const userRole = localStorage.getItem('userRole');

                const updatedUser = {
                    ...user,
                    name: updatedUserData.name || user.name,
                    email: updatedUserData.email || user.email,
                    perfil: updatedUserData.role || user.perfil
                };

                // Atualizar o contexto do usuário
                setUser(updatedUser);

                // Atualizar localStorage com o usuário atualizado
                localStorage.setItem('user', JSON.stringify(updatedUser));
                if (updatedUser.name) localStorage.setItem('userName', updatedUser.name);

                // Restaurar informações de autenticação
                if (token) localStorage.setItem('token', token);
                if (userId) localStorage.setItem('userId', userId);
                if (userRole) localStorage.setItem('userRole', userRole);
            }

            setUserManagementSuccessMessage(`Usuário "${userToEdit.name}" atualizado com sucesso!`);
            setUserManagementSuccess(true);
            handleCloseEditModal();
        } catch (error: any) {
            // Verificar se é erro de autenticação
            if (error.message && error.message.includes('Sessão expirada')) {
                // Limpar dados de autenticação
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                localStorage.removeItem('userName');
                localStorage.removeItem('userRole');
                localStorage.removeItem('user');

                // Limpar contexto do usuário
                setUser(null);

                // Redirecionar para login com mensagem de erro
                navigate('/login?message=' + encodeURIComponent(
                    "Sua sessão expirou. Por favor, faça login novamente."
                ));
                return;
            }

            console.error("Erro ao atualizar usuário:", error);
            setUserManagementError(error.message || "Erro ao atualizar usuário");
        } finally {
            setSavingUser(false);
        }
    };

    // Manipuladores para o modal de exclusão de usuário
    const handleOpenDeleteUserModal = (user: UserTableData) => {
        setUserToDelete(user);
        setDeleteUserModalOpen(true);
    };

    const handleCloseDeleteUserModal = () => {
        setDeleteUserModalOpen(false);
        setUserToDelete(null);
        setDeletingUser(false);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;

        setDeletingUser(true);
        try {
            await deleteUserAdmin(userToDelete.id);

            // Atualiza a lista de usuários após exclusão
            fetchUsers();
            setUserManagementSuccessMessage(`Usuário "${userToDelete.name}" excluído com sucesso!`);
            setUserManagementSuccess(true);
            handleCloseDeleteUserModal();
        } catch (error: any) {
            setUserManagementError(error.message || "Erro ao excluir usuário");
        } finally {
            setDeletingUser(false);
        }
    };

    // Funções separadas para fechar os snackbars
    const handleCloseProfileSnackbar = () => {
        setSuccess(false);
        setError("");
    };

    const handleCloseUserManagementSnackbar = () => {
        setUserManagementSuccess(false);
        setUserManagementError("");
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
                        "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(211, 100.00%, 70%), transparent)",
                    ...theme.applyStyles("dark", {
                        backgroundImage:
                            "radial-gradient(ellipse 80% 50% at 50% -20%, hsl(210, 100%, 12%), transparent)",
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
                                        {user && formData.name !== user.name && (
                                            <Alert severity="info" sx={{ mb: 2 }}>
                                                Alterar seu nome exigirá um novo login após a atualização.
                                            </Alert>
                                        )}

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

                        {/* Tabela de usuários para ADMINs */}
                        {user?.perfil === PerfilTypeEnum.ADMIN && (
                            <StyledCard sx={{ mt: 4 }}>
                                <SectionHeader>
                                    <GroupIcon color="primary" />
                                    <Typography variant="h6" fontWeight="500">
                                        Gestão de Usuários
                                    </Typography>
                                </SectionHeader>
                                <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Como administrador, você pode ver todos os usuários cadastrados na plataforma.
                                    </Typography>

                                    {usersError && (
                                        <Alert severity="error" sx={{ mb: 2 }}>
                                            {usersError}
                                            <Button
                                                size="small"
                                                color="inherit"
                                                sx={{ ml: 2 }}
                                                onClick={fetchUsers}
                                            >
                                                Tentar novamente
                                            </Button>
                                        </Alert>
                                    )}

                                    <TableContainer component={Paper} sx={{
                                        borderRadius: 2,
                                        boxShadow: 'none',
                                        border: '1px solid',
                                        borderColor: 'divider'
                                    }}>
                                        <Table sx={{ minWidth: 650 }} aria-label="tabela de usuários">
                                            <TableHead>
                                                <TableRow sx={{
                                                    backgroundColor: (theme) => theme.palette.mode === 'dark'
                                                        ? 'rgba(255, 255, 255, 0.05)'
                                                        : 'rgba(0, 0, 0, 0.02)'
                                                }}>
                                                    <TableCell>Nome</TableCell>
                                                    <TableCell>Email</TableCell>
                                                    <TableCell align="center">Perfil</TableCell>
                                                    <TableCell align="center">Ações</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {usersLoading ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                                            <CircularProgress size={30} />
                                                            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                                                                Carregando usuários...
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : users.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                                            <Typography variant="body1">
                                                                Nenhum usuário encontrado
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    users
                                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                        .map((user) => (
                                                            <TableRow key={user.id} hover>
                                                                <TableCell>{user.name}</TableCell>
                                                                <TableCell>{user.email}</TableCell>
                                                                <TableCell align="center">
                                                                    <Chip
                                                                        label={user.perfil === 'ADMIN' ? 'Administrador' : 'Usuário'}
                                                                        size="small"
                                                                        color={user.perfil === 'ADMIN' ? 'primary' : 'default'}
                                                                        variant={user.perfil === 'ADMIN' ? 'filled' : 'outlined'}
                                                                        sx={{
                                                                            minWidth: 90,
                                                                            fontWeight: 600,
                                                                            fontSize: '0.75rem',
                                                                            padding: '0 2px',
                                                                            borderRadius: '16px',
                                                                            '& .MuiChip-label': {
                                                                                padding: '0 8px'
                                                                            }
                                                                        }}
                                                                    />
                                                                </TableCell>
                                                                <TableCell align="center">
                                                                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                                                                        <Tooltip title="Editar">
                                                                            <IconButton
                                                                                size="small"
                                                                                color="primary"
                                                                                onClick={() => handleOpenEditModal(user)}
                                                                                sx={{
                                                                                    border: '1px solid',
                                                                                    borderColor: 'divider'
                                                                                }}
                                                                            >
                                                                                <EditIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                        <Tooltip title="Excluir">
                                                                            <IconButton
                                                                                size="small"
                                                                                color="error"
                                                                                onClick={() => handleOpenDeleteUserModal(user)}
                                                                                sx={{
                                                                                    border: '1px solid',
                                                                                    borderColor: 'divider'
                                                                                }}
                                                                            >
                                                                                <DeleteIcon fontSize="small" />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </Box>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <TablePagination
                                        rowsPerPageOptions={[5, 10, 25]}
                                        component="div"
                                        count={users.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        labelRowsPerPage="Linhas por página:"
                                        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                                    />
                                </CardContent>
                            </StyledCard>
                        )}

                        {/* Modal para editar usuário */}
                        <Dialog
                            open={editUserModalOpen}
                            onClose={handleCloseEditModal}
                            PaperProps={{
                                sx: {
                                    borderRadius: 3,
                                    width: '100%',
                                    maxWidth: 500
                                }
                            }}
                        >
                            <DialogTitle sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5
                            }}>
                                <EditIcon color="primary" />
                                Editar Usuário
                            </DialogTitle>
                            <DialogContent>
                                <Box component="form" sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                                    {/* Campos de formulário redesenhados conforme o padrão dos outros formulários */}
                                    <FormControl>
                                        <FormLabel htmlFor="name" sx={{ mb: 1, fontWeight: 500 }}>
                                            Nome completo
                                        </FormLabel>
                                        <TextField
                                            fullWidth
                                            id="name"
                                            name="name"
                                            placeholder="Fulano da Silva"
                                            autoComplete="name"
                                            value={userToEdit?.name || ''}
                                            onChange={handleEditUserChange}
                                            InputProps={{
                                                sx: { borderRadius: 1.5 }
                                            }}
                                        />
                                    </FormControl>

                                    <FormControl>
                                        <FormLabel htmlFor="email" sx={{ mb: 1, fontWeight: 500 }}>
                                            Email
                                        </FormLabel>
                                        <TextField
                                            fullWidth
                                            id="email"
                                            name="email"
                                            placeholder="seu.email@email.com"
                                            autoComplete="email"
                                            variant="outlined"
                                            value={userToEdit?.email || ''}
                                            onChange={handleEditUserChange}
                                            InputProps={{
                                                sx: { borderRadius: 1.5 }
                                            }}
                                        />
                                    </FormControl>
                                </Box>
                            </DialogContent>
                            <DialogActions sx={{ px: 3, pb: 3 }}>
                                <Button
                                    onClick={handleCloseEditModal}
                                    variant="text"
                                    sx={{ borderRadius: 2 }}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSaveUser}
                                    variant="contained"
                                    color="primary"
                                    disabled={savingUser}
                                    startIcon={savingUser ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {savingUser ? 'Salvando...' : 'Salvar'}
                                </Button>
                            </DialogActions>
                        </Dialog>

                        {/* Snackbars para notificações de perfil */}
                        <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseProfileSnackbar}>
                            <Alert
                                onClose={handleCloseProfileSnackbar}
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

                        <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseProfileSnackbar}>
                            <Alert
                                onClose={handleCloseProfileSnackbar}
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

                        {/* Snackbars para notificações de gestão de usuários */}
                        <Snackbar open={userManagementSuccess} autoHideDuration={6000} onClose={handleCloseUserManagementSnackbar}>
                            <Alert
                                onClose={handleCloseUserManagementSnackbar}
                                severity="success"
                                sx={{
                                    width: '100%',
                                    boxShadow: 2,
                                    borderRadius: 2
                                }}
                                variant="filled"
                            >
                                {userManagementSuccessMessage || "Operação realizada com sucesso!"}
                            </Alert>
                        </Snackbar>

                        <Snackbar open={!!userManagementError} autoHideDuration={6000} onClose={handleCloseUserManagementSnackbar}>
                            <Alert
                                onClose={handleCloseUserManagementSnackbar}
                                severity="error"
                                sx={{
                                    width: '100%',
                                    boxShadow: 2,
                                    borderRadius: 2
                                }}
                                variant="filled"
                            >
                                {userManagementError}
                            </Alert>
                        </Snackbar>

                        {/* Modal de confirmação de exclusão de usuário */}
                        <Dialog
                            open={deleteUserModalOpen}
                            onClose={handleCloseDeleteUserModal}
                            PaperProps={{
                                sx: {
                                    borderRadius: 3,
                                    width: '100%',
                                    maxWidth: 400
                                }
                            }}
                        >
                            <DialogTitle sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5
                            }}>
                                <WarningIcon color="error" />
                                Confirmar Exclusão
                            </DialogTitle>
                            <DialogContent>
                                <DialogContentText>
                                    Tem certeza que deseja excluir o usuário <strong>{userToDelete?.name}</strong>? Esta ação não pode ser desfeita.
                                </DialogContentText>
                            </DialogContent>
                            <DialogActions>
                                <Button onClick={handleCloseDeleteUserModal} color="inherit">
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleDeleteUser}
                                    color="error"
                                    variant="contained"
                                    autoFocus
                                    disabled={deletingUser}
                                    startIcon={deletingUser ? <CircularProgress size={20} color="inherit" /> : <DeleteIcon />}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {deletingUser ? 'Excluindo...' : 'Excluir'}
                                </Button>
                            </DialogActions>
                        </Dialog>
                    </Box>
                </Container>
            </Box>
        </AppTheme>
    );
}
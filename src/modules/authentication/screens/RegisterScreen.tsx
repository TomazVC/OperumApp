import React, {useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {RootStackNavigationProp} from '../../../core/navigation/types';
import {useAuth} from '../../../shared/hooks/useAuth';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import GradientBackground from '../../../shared/components/GradientBackground';
import Card from '../../../shared/components/Card';
import {isValidEmail} from '../../../shared/utils/validators';

const ScreenContainer = styled.View`
  flex: 1;
`;

const HeaderContainer = styled.View`
  padding: ${({theme}) => theme.spacing.xl}px ${({theme}) => theme.spacing.lg}px;
  align-items: center;
`;

const Logo = styled.Text`
  color: ${({theme}) => theme.colors.primary};
  font-size: 28px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h2.fontFamily};
`;

const ContentContainer = styled.View`
  flex: 1;
  padding: ${({theme}) => theme.spacing.lg}px;
  justify-content: center;
`;

const RegisterCard = styled(Card)`
  width: 100%;
  margin-bottom: ${({theme}) => theme.spacing.xl}px;
  ${({theme}) => theme.shadows.lg}
`;

const Title = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.h2.fontFamily};
`;

const Subtitle = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 16px;
  text-align: center;
  margin-bottom: ${({theme}) => theme.spacing.xl}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const FormContainer = styled.View`
  width: 100%;
`;

const ButtonContainer = styled.View`
  margin-top: ${({theme}) => theme.spacing.lg}px;
`;

const LoginLink = styled(TouchableOpacity)`
  margin-top: ${({theme}) => theme.spacing.lg}px;
  align-items: center;
`;

const LoginText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 14px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const LoginLinkText = styled.Text`
  color: ${({theme}) => theme.colors.primary};
  font-weight: 600;
`;

const PasswordStrengthContainer = styled.View`
  margin-top: ${({theme}) => theme.spacing.xs}px;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const PasswordStrengthBar = styled.View`
  height: 4px;
  background-color: #E5E7EB;
  border-radius: 2px;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  overflow: hidden;
`;

const PasswordStrengthFill = styled.View<{strength: number; color: string}>`
  height: 100%;
  width: ${({strength}) => (strength / 5) * 100}%;
  background-color: ${({color}) => color};
  border-radius: 2px;
`;

const PasswordStrengthText = styled.Text<{color: string}>`
  color: ${({color}) => color};
  font-size: 12px;
  font-weight: 500;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const SuccessMessage = styled.Text`
  color: ${({theme}) => theme.colors.success || '#10B981'};
  font-size: 12px;
  margin-top: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {registerWithEmail, isLoading} = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{name?: string; email?: string; password?: string; confirmPassword?: string}>({});
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Função para calcular força da senha
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  // Função para obter texto da força da senha
  const getPasswordStrengthText = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return 'Muito fraca';
      case 2:
        return 'Fraca';
      case 3:
        return 'Média';
      case 4:
        return 'Forte';
      case 5:
        return 'Muito forte';
      default:
        return '';
    }
  };

  // Função para obter cor da força da senha
  const getPasswordStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0:
      case 1:
        return '#EF4444'; // Vermelho
      case 2:
        return '#F59E0B'; // Amarelo
      case 3:
        return '#3B82F6'; // Azul
      case 4:
        return '#10B981'; // Verde
      case 5:
        return '#059669'; // Verde escuro
      default:
        return '#6B7280'; // Cinza
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {name?: string; email?: string; password?: string; confirmPassword?: string} = {};

    if (!name.trim()) {
      newErrors.name = 'Nome completo é obrigatório';
    } else if (name.trim().split(' ').length < 2) {
      newErrors.name = 'Digite seu nome completo';
    }

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 8) {
      newErrors.password = 'Senha deve ter pelo menos 8 caracteres';
    } else if (passwordStrength < 3) {
      newErrors.password = 'Senha muito fraca. Use letras maiúsculas, minúsculas, números e símbolos';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    setPasswordStrength(calculatePasswordStrength(text));
    
    // Limpar erro de senha quando o usuário começar a digitar
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    
    // Limpar erro de confirmação quando o usuário começar a digitar
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: undefined }));
    }
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      const user = await registerWithEmail(name, email, password);
      // Redirecionamento para questionário de perfil após registro bem-sucedido
      navigation.replace('RiskProfile', { userId: user.id });
    } catch (e: any) {
      console.error('Erro no registro:', e);
      
      // Tratar erros específicos com feedback visual nos campos
      if (e?.message?.includes('E-mail já cadastrado')) {
        setErrors(prev => ({ ...prev, email: 'Este e-mail já está cadastrado' }));
      } else if (e?.message?.includes('Falha ao criar usuário')) {
        setErrors(prev => ({ ...prev, email: 'Erro interno. Tente novamente.' }));
      } else {
        // Apenas erros inesperados mostram Alert
        Alert.alert('Erro', 'Não foi possível criar sua conta. Tente novamente.');
      }
    }
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <GradientBackground variant="light">
      <ScreenContainer>
        <HeaderContainer>
          <Logo>Operum</Logo>
        </HeaderContainer>
        
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{flex: 1}}
        >
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
            <ContentContainer>
              <RegisterCard variant="elevated">
                <Title>Criar conta</Title>
                <Subtitle>Comece sua jornada de investimentos inteligentes</Subtitle>
                
                <FormContainer>
                  <Input
                    label="Nome completo"
                    placeholder="Seu nome"
                    value={name}
                    onChangeText={setName}
                    error={errors.name}
                    autoCapitalize="words"
                    icon={<Ionicons name="person-outline" size={20} color="#8B5CF6" />}
                  />
                  
                  <Input
                    label="E-mail"
                    placeholder="seu@email.com"
                    value={email}
                    onChangeText={setEmail}
                    error={errors.email}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    icon={<Ionicons name="mail-outline" size={20} color="#8B5CF6" />}
                  />
                  
                  <Input
                    label="Senha"
                    placeholder="Digite sua senha"
                    value={password}
                    onChangeText={handlePasswordChange}
                    error={errors.password}
                    secureTextEntry
                    showPasswordToggle
                    icon={<Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" />}
                  />
                  
                  {password.length > 0 && (
                    <PasswordStrengthContainer>
                      <PasswordStrengthBar>
                        <PasswordStrengthFill 
                          strength={passwordStrength} 
                          color={getPasswordStrengthColor(passwordStrength)} 
                        />
                      </PasswordStrengthBar>
                      <PasswordStrengthText color={getPasswordStrengthColor(passwordStrength)}>
                        Força da senha: {getPasswordStrengthText(passwordStrength)}
                      </PasswordStrengthText>
                    </PasswordStrengthContainer>
                  )}
                  
                  <Input
                    label="Confirmar senha"
                    placeholder="Digite sua senha novamente"
                    value={confirmPassword}
                    onChangeText={handleConfirmPasswordChange}
                    error={errors.confirmPassword}
                    secureTextEntry
                    showPasswordToggle
                    icon={<Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" />}
                  />
                  
                  {confirmPassword.length > 0 && password === confirmPassword && (
                    <SuccessMessage>✓ As senhas coincidem</SuccessMessage>
                  )}
                  
                  <ButtonContainer>
                    <Button
                      title="Criar conta"
                      onPress={handleRegister}
                      disabled={isLoading}
                      variant="gradient"
                      size="large"
                    />
                  </ButtonContainer>

                  <LoginLink onPress={handleLogin}>
                    <LoginText>
                      Já tem conta? <LoginLinkText>Fazer login</LoginLinkText>
                    </LoginText>
                  </LoginLink>
                </FormContainer>
              </RegisterCard>
            </ContentContainer>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenContainer>
    </GradientBackground>
  );
};

export default RegisterScreen;

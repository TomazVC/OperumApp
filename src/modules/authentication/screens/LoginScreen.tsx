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
import {isValidCPF, isValidEmail} from '../../../shared/utils/validators';

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

const LoginCard = styled(Card)`
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

const RegisterLink = styled.TouchableOpacity`
  margin-top: ${({theme}) => theme.spacing.lg}px;
  align-items: center;
`;

const RegisterText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 14px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const RegisterLinkText = styled.Text`
  color: ${({theme}) => theme.colors.primary};
  font-weight: 600;
`;

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {signInWithEmail, isLoading} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  const handleEmailChange = (text: string) => {
    setEmail(text);
    // Limpar erro de email quando o usuário começar a digitar
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    // Limpar erro de senha quando o usuário começar a digitar
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {email?: string; password?: string} = {};

    if (!email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!isValidEmail(email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;

    try {
      await signInWithEmail(email, password);
      // Redirecionamento automático após login bem-sucedido
      navigation.replace('Main');
    } catch (e: any) {
      console.error('Erro no login:', e);
      
      // Tratar erros específicos com feedback visual nos campos
      if (e?.message?.includes('Credenciais inválidas')) {
        // Diferenciação entre usuário não encontrado e senha incorreta
        setErrors(prev => ({ 
          ...prev, 
          email: 'E-mail ou senha incorretos',
          password: 'E-mail ou senha incorretos'
        }));
      } else if (e?.message?.includes('Usuário não encontrado')) {
        setErrors(prev => ({ 
          ...prev, 
          email: 'Usuário não encontrado',
          password: undefined
        }));
      } else {
        // Apenas erros inesperados mostram Alert
        Alert.alert('Erro', 'Não foi possível fazer login. Tente novamente.');
      }
    }
  };


  const handleRegister = () => {
    navigation.navigate('Register');
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
              <LoginCard variant="elevated">
                <Title>Bem-vindo de volta</Title>
                <Subtitle>Entre para continuar sua jornada de investimentos</Subtitle>
                
                <FormContainer>
                  <Input
                    label="E-mail"
                    placeholder="seu@email.com"
                    value={email}
                    onChangeText={handleEmailChange}
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
                  
                  <ButtonContainer>
                    <Button
                      title="Entrar"
                      onPress={handleSignIn}
                      disabled={isLoading}
                      variant="gradient"
                      size="large"
                    />
                  </ButtonContainer>

                  <RegisterLink onPress={handleRegister}>
                    <RegisterText>
                      Não tem conta? <RegisterLinkText>Cadastre-se</RegisterLinkText>
                    </RegisterText>
                  </RegisterLink>
                </FormContainer>
              </LoginCard>
            </ContentContainer>
          </ScrollView>
        </KeyboardAvoidingView>
      </ScreenContainer>
    </GradientBackground>
  );
};

export default LoginScreen;

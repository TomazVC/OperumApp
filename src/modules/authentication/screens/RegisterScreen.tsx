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

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {registerWithEmail, isLoading} = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{name?: string; email?: string; password?: string}>({});

  const validateForm = (): boolean => {
    const newErrors: {name?: string; email?: string; password?: string} = {};

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
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;

    try {
      await registerWithEmail(name, email, password);
      navigation.replace('Portfolio');
    } catch (e: any) {
      Alert.alert('Erro', e?.message || 'Não foi possível criar sua conta. Tente novamente.');
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
                    onChangeText={setPassword}
                    error={errors.password}
                    secureTextEntry
                    showPasswordToggle
                    icon={<Ionicons name="lock-closed-outline" size={20} color="#8B5CF6" />}
                  />
                  
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

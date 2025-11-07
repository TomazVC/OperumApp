import React, {useState} from 'react';
import styled from 'styled-components/native';
import {TextInputProps, View} from 'react-native';
import {Ionicons} from '@expo/vector-icons';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string | React.ReactNode;
  iconLibrary?: 'Ionicons' | 'MaterialIcons' | 'AntDesign' | 'Feather';
  showPasswordToggle?: boolean;
}

const InputContainer = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

const Label = styled.Text<{focused: boolean}>`
  color: ${({theme, focused}) => (focused ? theme.colors.secondary : theme.colors.text)};
  font-size: 14px;
  font-weight: 500;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const InputWrapper = styled.View<{focused: boolean; error?: string}>`
  background-color: ${({theme}) => theme.colors.background};
  border-radius: ${({theme}) => theme.borderRadius.lg}px;
  border-width: 2px;
  border-style: solid;
  border-color: ${({theme, focused, error}) => {
    if (error) return theme.colors.error;
    if (focused) return theme.colors.primary;
    return theme.colors.border;
  }};
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  ${({theme, focused}) => focused && theme.shadows.md}
`;

const IconContainer = styled.View`
  padding-left: ${({theme}) => theme.spacing.md}px;
  padding-right: ${({theme}) => theme.spacing.sm}px;
`;

const InputField = styled.View`
  flex: 1;
  flex-shrink: 1;
  min-width: 0;
  flex-direction: row;
  align-items: center;
`;

const StyledInput = styled.TextInput<{error?: string; hasIcon?: boolean; hasPasswordToggle?: boolean}>`
  background-color: transparent;
  color: ${({theme}) => theme.colors.text};
  padding-top: ${({theme}) => theme.spacing.md}px;
  padding-bottom: ${({theme}) => theme.spacing.md}px;
  padding-left: ${({theme, hasIcon}) => hasIcon ? theme.spacing.sm : theme.spacing.md}px;
  padding-right: ${({theme, hasIcon, hasPasswordToggle}) => {
    if (hasPasswordToggle) return theme.spacing.xs;
    return hasIcon ? theme.spacing.sm : theme.spacing.md;
  }}px;
  font-size: 16px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
  min-height: 48px;
  flex: 1;
  flex-shrink: 1;
  min-width: 0;
`;

const PasswordToggle = styled.TouchableOpacity`
  padding: ${({theme}) => theme.spacing.sm}px;
  padding-right: ${({theme}) => theme.spacing.md}px;
  flex-shrink: 0;
`;

const ErrorText = styled.Text`
  color: ${({theme}) => theme.colors.error};
  font-size: 12px;
  margin-top: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const Input: React.FC<InputProps> = ({
  label, 
  error, 
  onFocus, 
  onBlur, 
  icon,
  iconLibrary = 'Ionicons',
  showPasswordToggle = false,
  secureTextEntry,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleFocus = (e: any) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setFocused(false);
    onBlur?.(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const renderIcon = () => {
    if (!icon) return null;
    
    // Se o ícone é um componente React, renderiza diretamente
    if (typeof icon !== 'string') {
      return (
        <IconContainer>
          {icon}
        </IconContainer>
      );
    }
    
    // Se o ícone é uma string, renderiza como Ionicons
    return (
      <IconContainer>
        <Ionicons 
          name={icon as any} 
          size={20} 
          color={focused ? '#8B5CF6' : '#6B7280'} 
        />
      </IconContainer>
    );
  };

  return (
    <InputContainer>
      {label && <Label focused={focused}>{label}</Label>}
      <InputWrapper focused={focused} error={error}>
        {renderIcon()}
        <InputField>
          <StyledInput
            placeholderTextColor="#9CA3AF"
            error={error}
            onFocus={handleFocus}
            onBlur={handleBlur}
            secureTextEntry={secureTextEntry && !showPassword}
            hasIcon={!!icon}
            hasPasswordToggle={showPasswordToggle && secureTextEntry}
            {...props}
          />
          {showPasswordToggle && secureTextEntry && (
            <PasswordToggle onPress={togglePasswordVisibility}>
              <Ionicons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#6B7280" 
              />
            </PasswordToggle>
          )}
        </InputField>
      </InputWrapper>
      {error && <ErrorText>{error}</ErrorText>}
    </InputContainer>
  );
};

export default Input;

import React from 'react';
import styled from 'styled-components/native';
import {TouchableOpacityProps, Platform} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'white';
  size?: 'small' | 'medium' | 'large';
  icon?: React.ReactNode;
}

const ButtonContainer = styled.TouchableOpacity<{
  variant: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'white';
  size: 'small' | 'medium' | 'large';
  disabled?: boolean;
}>`
  border-radius: ${({theme}) => theme.borderRadius.lg}px;
  align-items: center;
  justify-content: center;
  opacity: ${({disabled}) => (disabled ? 0.6 : 1)};
  overflow: hidden;
  background-color: ${({theme, variant}) => {
    switch (variant) {
      case 'primary':
        return theme.colors.primary;
      case 'secondary':
        return theme.colors.secondary;
      case 'ghost':
        return theme.colors.overlay;
      case 'gradient':
        return theme.colors.primary;
      case 'white':
        return '#FFFFFF';
      default:
        return theme.colors.primary;
    }
  }};
  ${({theme, variant}) => variant === 'ghost' && `
    border-width: 1px;
    border-color: ${theme.colors.border};
    border-style: solid;
  `}
  ${({theme, variant}) => variant === 'white' && `
    border-width: 1px;
    border-color: ${theme.colors.border};
    border-style: solid;
  `}
  ${({theme}) => theme.shadows.md}
`;

const ButtonContent = styled.View<{
  size: 'small' | 'medium' | 'large';
}>`
  padding: ${({theme, size}) => {
    switch (size) {
      case 'small':
        return `${theme.spacing.sm}px ${theme.spacing.md}px`;
      case 'medium':
        return `${theme.spacing.md}px ${theme.spacing.lg}px`;
      case 'large':
        return `${theme.spacing.lg}px ${theme.spacing.xl}px`;
      default:
        return `${theme.spacing.md}px ${theme.spacing.lg}px`;
    }
  }};
  align-items: center;
  justify-content: center;
  min-height: ${({size}) => {
    switch (size) {
      case 'small':
        return 40;
      case 'medium':
        return 48;
      case 'large':
        return 56;
      default:
        return 48;
    }
  }}px;
`;

const ButtonText = styled.Text<{
  variant: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'white';
  size: 'small' | 'medium' | 'large';
}>`
  color: ${({theme, variant}) => {
    switch (variant) {
      case 'primary':
        return theme.colors.background;
      case 'secondary':
        return theme.colors.background;
      case 'ghost':
        return theme.colors.text;
      case 'gradient':
        return theme.colors.background;
      case 'white':
        return theme.colors.primary;
      default:
        return theme.colors.background;
    }
  }};
  font-size: ${({size}) => {
    switch (size) {
      case 'small':
        return 14;
      case 'medium':
        return 16;
      case 'large':
        return 18;
      default:
        return 16;
    }
  }}px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const IconContainer = styled.View`
  margin-left: ${({theme}) => theme.spacing.sm}px;
`;

const Button: React.FC<ButtonProps> = ({
  title,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  icon,
  ...props
}) => {
  return (
    <ButtonContainer
      variant={variant}
      size={size}
      disabled={disabled}
      activeOpacity={0.8}
      {...props}>
      <ButtonContent size={size}>
        <ButtonText variant={variant} size={size}>
          {title}
        </ButtonText>
        {icon && <IconContainer>{icon}</IconContainer>}
      </ButtonContent>
    </ButtonContainer>
  );
};

export default Button;

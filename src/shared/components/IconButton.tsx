import React from 'react';
import styled from 'styled-components/native';
import {TouchableOpacityProps} from 'react-native';
import {Ionicons, MaterialIcons, AntDesign, Feather} from '@expo/vector-icons';

interface IconButtonProps extends TouchableOpacityProps {
  icon: React.ReactNode;
  variant?: 'default' | 'translucent' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  iconLibrary?: 'Ionicons' | 'MaterialIcons' | 'AntDesign' | 'Feather';
  iconName?: string;
}

const StyledIconButton = styled.TouchableOpacity<{
  variant?: 'default' | 'translucent' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  color?: string;
}>`
  width: ${({size}) => {
    switch (size) {
      case 'small':
        return 32;
      case 'medium':
        return 40;
      case 'large':
        return 48;
      default:
        return 40;
    }
  }}px;
  height: ${({size}) => {
    switch (size) {
      case 'small':
        return 32;
      case 'medium':
        return 40;
      case 'large':
        return 48;
      default:
        return 40;
    }
  }}px;
  border-radius: ${({theme}) => theme.borderRadius.full}px;
  align-items: center;
  justify-content: center;
  background-color: ${({theme, variant}) => {
    switch (variant) {
      case 'translucent':
        return theme.colors.overlay;
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.background;
    }
  }};
  border-width: ${({variant}) => {
    switch (variant) {
      case 'ghost':
        return 0;
      default:
        return 1;
    }
  }}px;
  border-style: solid;
  border-color: ${({theme, variant}) => {
    switch (variant) {
      case 'translucent':
        return theme.colors.borderLight;
      case 'ghost':
        return 'transparent';
      default:
        return theme.colors.border;
    }
  }};
  ${({theme, variant}) => variant === 'default' && theme.shadows.sm}
`;

const IconContainer = styled.View<{
  size?: 'small' | 'medium' | 'large';
  color?: string;
}>`
  align-items: center;
  justify-content: center;
`;

const IconButton: React.FC<IconButtonProps> = ({
  icon,
  variant = 'default',
  size = 'medium',
  color,
  iconLibrary = 'Ionicons',
  iconName,
  ...props
}) => {
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 24;
      default:
        return 20;
    }
  };

  const renderIcon = () => {
    if (iconName && iconLibrary) {
      const iconColor = color || '#EF44F2';
      const iconSize = getIconSize();
      
      switch (iconLibrary) {
        case 'Ionicons':
          return <Ionicons name={iconName as any} size={iconSize} color={iconColor} />;
        case 'MaterialIcons':
          return <MaterialIcons name={iconName as any} size={iconSize} color={iconColor} />;
        case 'AntDesign':
          return <AntDesign name={iconName as any} size={iconSize} color={iconColor} />;
        case 'Feather':
          return <Feather name={iconName as any} size={iconSize} color={iconColor} />;
        default:
          return <Ionicons name={iconName as any} size={iconSize} color={iconColor} />;
      }
    }
    return icon;
  };

  return (
    <StyledIconButton
      variant={variant}
      size={size}
      color={color}
      activeOpacity={0.7}
      {...props}>
      <IconContainer size={size} color={color}>
        {renderIcon()}
      </IconContainer>
    </StyledIconButton>
  );
};

export default IconButton;

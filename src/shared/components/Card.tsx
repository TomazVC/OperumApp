import React from 'react';
import styled from 'styled-components/native';
import {ViewStyle} from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: boolean;
  onPress?: () => void;
}

const StyledCard = styled.TouchableOpacity<{
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: boolean;
}>`
  background-color: ${({theme}) => theme.colors.card};
  border-radius: ${({theme}) => theme.borderRadius.lg}px;
  ${({padding, theme}) => padding && `padding: ${theme.spacing.lg}px;`}
  ${({variant, theme}) => {
    switch (variant) {
      case 'elevated':
        return theme.shadows.lg;
      case 'outlined':
        return `
          border-width: 1px;
          border-color: ${theme.colors.border};
          border-style: solid;
        `;
      default:
        return theme.shadows.md;
    }
  }}
`;

const Card: React.FC<CardProps> = ({
  children,
  style,
  variant = 'default',
  padding = true,
  onPress,
}) => (
  <StyledCard
    style={style}
    variant={variant}
    padding={padding}
    onPress={onPress}
    activeOpacity={onPress ? 0.95 : 1}>
    {children}
  </StyledCard>
);

export default Card;

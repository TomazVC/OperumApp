import React from 'react';
import styled from 'styled-components/native';
import {ViewStyle} from 'react-native';

interface ContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: boolean;
  variant?: 'default' | 'card' | 'translucent';
  shadow?: boolean;
}

const StyledContainer = styled.View<{
  padding?: boolean;
  variant?: 'default' | 'card' | 'translucent';
  shadow?: boolean;
}>`
  flex: 1;
  background-color: ${({theme, variant}) => {
    switch (variant) {
      case 'card':
        return theme.colors.card;
      case 'translucent':
        return theme.colors.overlay;
      default:
        return theme.colors.background;
    }
  }};
  ${({padding, theme}) => padding && `padding: ${theme.spacing.lg}px;`}
  ${({variant, theme}) => variant === 'card' && `
    border-radius: ${theme.borderRadius.lg}px;
    border-width: 1px;
    border-style: solid;
    border-color: ${theme.colors.border};
  `}
  ${({variant, theme}) => variant === 'translucent' && `
    border-radius: ${theme.borderRadius.lg}px;
    border-width: 1px;
    border-style: solid;
    border-color: ${theme.colors.borderLight};
  `}
  ${({shadow, theme}) => shadow && theme.shadows.md}
`;

const Container: React.FC<ContainerProps> = ({
  children,
  style,
  padding = true,
  variant = 'default',
  shadow = false,
}) => (
  <StyledContainer
    style={style}
    padding={padding}
    variant={variant}
    shadow={shadow}>
    {children}
  </StyledContainer>
);

export default Container;

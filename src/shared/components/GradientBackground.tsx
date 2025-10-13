import React from 'react';
import styled from 'styled-components/native';
import {ViewStyle} from 'react-native';

interface GradientBackgroundProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'primary' | 'light' | 'custom';
  colors?: string[];
}

const BackgroundContainer = styled.View<{
  variant: 'primary' | 'light' | 'custom';
  colors?: string[];
}>`
  flex: 1;
  background-color: ${({theme, variant, colors}) => {
    if (variant === 'primary') {
      return theme.colors.gradientStart;
    }
    if (variant === 'light') {
      return theme.colors.background;
    }
    if (colors && colors.length > 0) {
      return colors[0];
    }
    return theme.colors.background;
  }};
`;

const Content = styled.View`
  flex: 1;
  width: 100%;
`;

const GradientBackground: React.FC<GradientBackgroundProps> = ({
  children,
  style,
  variant = 'primary',
  colors,
}) => {
  return (
    <BackgroundContainer style={style} variant={variant} colors={colors}>
      <Content>{children}</Content>
    </BackgroundContainer>
  );
};

export default GradientBackground;

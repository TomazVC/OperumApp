import React from 'react';
import styled from 'styled-components/native';
import {ViewStyle, Platform} from 'react-native';

interface GradientHeaderProps {
  children: React.ReactNode;
  style?: ViewStyle;
  height?: number;
  variant?: 'primary' | 'secondary' | 'accent';
}

const HeaderContainer = styled.View<{height: number; variant: string}>`
  height: ${({height}) => height}px;
  width: 100%;
  overflow: hidden;
  justify-content: center;
  align-items: center;
  padding: ${({theme}) => theme.spacing.lg}px;
  background-color: ${({variant}) => {
    switch (variant) {
      case 'primary':
        return '#EF44F2';
      case 'secondary':
        return '#4A88D9';
      case 'accent':
        return '#EF44F2';
      default:
        return '#EF44F2';
    }
  }};
`;

const Content = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  width: 100%;
`;

const GradientHeader: React.FC<GradientHeaderProps> = ({
  children,
  style,
  height = 120,
  variant = 'primary',
}) => {
  return (
    <HeaderContainer style={style} height={height} variant={variant}>
      <Content>{children}</Content>
    </HeaderContainer>
  );
};

export default GradientHeader;

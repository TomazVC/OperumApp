import React from 'react';
import styled from 'styled-components/native';
import {ViewProps} from 'react-native';

interface TranslucentCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated';
}

const StyledCard = styled.View<TranslucentCardProps>`
  background-color: ${({theme}) => theme.colors.cardTranslucent};
  border-radius: ${({theme}) => theme.borderRadius.lg}px;
  padding-top: ${({theme}) => theme.spacing.lg}px;
  padding-bottom: ${({theme}) => theme.spacing.lg}px;
  padding-left: ${({theme}) => theme.spacing.lg}px;
  padding-right: ${({theme}) => theme.spacing.lg}px;
  border-width: 1px;
  border-color: rgba(255, 255, 255, 0.3);
  border-style: solid;
`;

const TranslucentCard: React.FC<TranslucentCardProps> = ({
  children,
  variant = 'default',
  ...props
}) => {
  return (
    <StyledCard variant={variant} {...props}>
      {children}
    </StyledCard>
  );
};

export default TranslucentCard;

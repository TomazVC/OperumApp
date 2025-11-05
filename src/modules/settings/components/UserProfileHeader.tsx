import React from 'react';
import styled from 'styled-components/native';
import {Ionicons} from '@expo/vector-icons';

interface UserProfileHeaderProps {
  name: string;
}

const Container = styled.View`
  padding: ${({theme}) => theme.spacing.lg}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-bottom-width: 1px;
  border-bottom-color: ${({theme}) => theme.colors.border};
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
`;

const AvatarContainer = styled.View`
  width: 64px;
  height: 64px;
  border-radius: 32px;
  background-color: ${({theme}) => theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-right: ${({theme}) => theme.spacing.md}px;
`;

const AvatarText = styled.Text`
  color: ${({theme}) => theme.colors.textLight};
  font-size: 24px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h2.fontFamily};
`;

const NameContainer = styled.View`
  flex: 1;
`;

const NameText = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 24px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h2.fontFamily};
`;

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({name}) => {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <Container>
      <AvatarContainer>
        <AvatarText>{initials}</AvatarText>
      </AvatarContainer>
      <NameContainer>
        <NameText>{name}</NameText>
      </NameContainer>
    </Container>
  );
};

export default UserProfileHeader;


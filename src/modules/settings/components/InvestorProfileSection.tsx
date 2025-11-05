import React from 'react';
import styled from 'styled-components/native';
import {Ionicons} from '@expo/vector-icons';
import {RiskProfile} from '../../../shared/types';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import {getRiskProfileDescription} from '../../authentication/services/riskProfileService';

interface InvestorProfileSectionProps {
  riskProfile?: RiskProfile;
  onRetakeTest: () => void;
}

const Container = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

const SectionCard = styled(Card)`
  padding: ${({theme}) => theme.spacing.lg}px;
  ${({theme}) => theme.shadows.sm}
`;

const SectionTitle = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 20px;
  font-weight: 700;
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const ProfileHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

const ProfileIcon = styled.View`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({theme}) => theme.colors.primary};
  justify-content: center;
  align-items: center;
  margin-right: ${({theme}) => theme.spacing.md}px;
`;

const ProfileInfo = styled.View`
  flex: 1;
`;

const ProfileName = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 18px;
  font-weight: 700;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const ProfileDescription = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 20px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const PreferencesSection = styled.View`
  margin-top: ${({theme}) => theme.spacing.lg}px;
  padding-top: ${({theme}) => theme.spacing.lg}px;
  border-top-width: 1px;
  border-top-color: ${({theme}) => theme.colors.border};
`;

const PreferencesTitle = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 16px;
  font-weight: 600;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const PreferenceItem = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const PreferenceLabel = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 14px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const PreferenceValue = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 14px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

// Distribuições por perfil (baseado em PROFILE_DISTRIBUTIONS)
const PROFILE_DISTRIBUTIONS: Record<RiskProfile, {category: string; percentage: number}[]> = {
  Conservador: [
    {category: 'Renda Fixa', percentage: 70},
    {category: 'Fundos', percentage: 20},
    {category: 'Renda Variável', percentage: 10},
  ],
  Moderado: [
    {category: 'Renda Fixa', percentage: 40},
    {category: 'Fundos', percentage: 30},
    {category: 'Renda Variável', percentage: 30},
  ],
  Agressivo: [
    {category: 'Renda Fixa', percentage: 20},
    {category: 'Fundos', percentage: 30},
    {category: 'Renda Variável', percentage: 50},
  ],
};

// Liquidez preferida por perfil
const PROFILE_LIQUIDITY: Record<RiskProfile, string> = {
  Conservador: 'Alta',
  Moderado: 'Média',
  Agressivo: 'Baixa',
};

const InvestorProfileSection: React.FC<InvestorProfileSectionProps> = ({
  riskProfile,
  onRetakeTest,
}) => {
  if (!riskProfile) {
    return (
      <Container>
        <SectionCard variant="elevated">
          <SectionTitle>Perfil do Investidor</SectionTitle>
          <ProfileDescription style={{textAlign: 'center', marginVertical: 16}}>
            Você ainda não completou o teste de perfil de investidor.
          </ProfileDescription>
          <Button
            title="Fazer Teste de Perfil"
            onPress={onRetakeTest}
            variant="gradient"
            size="medium"
            icon={<Ionicons name="person-outline" size={18} color="#FFFFFF" />}
          />
        </SectionCard>
      </Container>
    );
  }

  const distribution = PROFILE_DISTRIBUTIONS[riskProfile];
  const fixedIncome = distribution.find(d => d.category === 'Renda Fixa')?.percentage || 0;
  const variableIncome = distribution.find(d => d.category === 'Renda Variável')?.percentage || 0;
  const liquidity = PROFILE_LIQUIDITY[riskProfile];

  return (
    <Container>
      <SectionCard variant="elevated">
        <SectionTitle>Perfil do Investidor</SectionTitle>

        <ProfileHeader>
          <ProfileIcon>
            <Ionicons name="person-outline" size={24} color="#FFFFFF" />
          </ProfileIcon>
          <ProfileInfo>
            <ProfileName>{riskProfile}</ProfileName>
            <ProfileDescription>{getRiskProfileDescription(riskProfile)}</ProfileDescription>
          </ProfileInfo>
        </ProfileHeader>

        <PreferencesSection>
          <PreferencesTitle>Preferências de Investimento</PreferencesTitle>

          <PreferenceItem>
            <PreferenceLabel>Liquidez Preferida</PreferenceLabel>
            <PreferenceValue>{liquidity}</PreferenceValue>
          </PreferenceItem>

          <PreferenceItem>
            <PreferenceLabel>% Renda Fixa</PreferenceLabel>
            <PreferenceValue>{fixedIncome}%</PreferenceValue>
          </PreferenceItem>

          <PreferenceItem>
            <PreferenceLabel>% Renda Variável</PreferenceLabel>
            <PreferenceValue>{variableIncome}%</PreferenceValue>
          </PreferenceItem>
        </PreferencesSection>

        <Button
          title="Refazer Teste"
          onPress={onRetakeTest}
          variant="secondary"
          size="medium"
          icon={<Ionicons name="refresh-outline" size={18} color="#8B5CF6" />}
          style={{marginTop: 16}}
        />
      </SectionCard>
    </Container>
  );
};

export default InvestorProfileSection;


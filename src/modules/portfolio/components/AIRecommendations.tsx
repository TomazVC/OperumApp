import React, {useState} from 'react';
import {View, Text, ScrollView, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {Ionicons} from '@expo/vector-icons';
import {RiskProfile, RecommendedPortfolio, RecommendedAsset} from '../../../shared/types';
import {formatPercentage} from '../../../shared/utils/formatters';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import {portfolioSimulationService} from '../services/portfolioSimulationService';

interface AIRecommendationsProps {
  riskProfile?: RiskProfile;
  onApplyRecommendation?: (portfolio: RecommendedPortfolio) => void;
}

const Container = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
`;

const Title = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 20px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const RecommendedPortfolioCard = styled(Card)`
  margin-bottom: ${({theme}) => theme.spacing.md}px;
  padding: ${({theme}) => theme.spacing.lg}px;
`;

const PortfolioHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
`;

const PortfolioIcon = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({theme}) => theme.colors.primary}20;
  justify-content: center;
  align-items: center;
  margin-right: ${({theme}) => theme.spacing.sm}px;
`;

const PortfolioTitle = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 16px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const DistributionList = styled.View`
  margin-top: ${({theme}) => theme.spacing.sm}px;
`;

const DistributionRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${({theme}) => theme.spacing.sm}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${({theme}) => theme.colors.border};
`;

const DistributionBar = styled.View<{percentage: number; color: string}>`
  height: 8px;
  width: ${({percentage}) => percentage}%;
  background-color: ${({color}) => color};
  border-radius: 4px;
  margin-right: ${({theme}) => theme.spacing.sm}px;
  flex: 1;
`;

const AssetsList = styled.View`
  margin-top: ${({theme}) => theme.spacing.md}px;
`;

const AssetCard = styled(Card)`
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  padding: ${({theme}) => theme.spacing.md}px;
`;

const AssetHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
`;

const AssetName = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 16px;
  font-weight: 600;
  flex: 1;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const Badge = styled.View<{color: string}>`
  background-color: ${({color}) => color}20;
  padding: ${({theme}) => theme.spacing.xs}px ${({theme}) => theme.spacing.sm}px;
  border-radius: ${({theme}) => theme.borderRadius.sm}px;
  margin-left: ${({theme}) => theme.spacing.sm}px;
`;

const BadgeText = styled.Text<{color: string}>`
  color: ${({color}) => color};
  font-size: 11px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const AssetInfo = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: ${({theme}) => theme.spacing.xs}px;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

const InfoItem = styled.View`
  flex-direction: row;
  align-items: center;
`;

const InfoText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 12px;
  margin-left: 4px;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const ExpandButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  margin-top: ${({theme}) => theme.spacing.xs}px;
`;

const ExpandText = styled.Text`
  color: ${({theme}) => theme.colors.primary};
  font-size: 12px;
  font-weight: 500;
  margin-left: 4px;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const JustificationText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 13px;
  margin-top: ${({theme}) => theme.spacing.xs}px;
  line-height: 18px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const EmptyState = styled.View`
  padding: ${({theme}) => theme.spacing.xl}px;
  align-items: center;
`;

const EmptyText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 14px;
  text-align: center;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const categoryColors: Record<string, string> = {
  'Renda Fixa': '#10B981',
  'Fundos': '#8B5CF6',
  'Renda Variável': '#EF4444',
};

const riskColors: Record<string, string> = {
  'Baixo': '#10B981',
  'Médio': '#F59E0B',
  'Alto': '#EF4444',
};

const liquidityColors: Record<string, string> = {
  'Alta': '#10B981',
  'Média': '#F59E0B',
  'Baixa': '#EF4444',
};

const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  riskProfile,
  onApplyRecommendation,
}) => {
  const [expandedAssets, setExpandedAssets] = useState<Set<string>>(new Set());

  if (!riskProfile) {
    return (
      <Container>
        <Header>
          <Title>Sugestões da IA</Title>
        </Header>
        <Card variant="elevated" padding>
          <EmptyState>
            <Ionicons name="information-circle-outline" size={32} color="#8B5CF6" />
            <EmptyText style={{marginTop: 8}}>
              Complete seu perfil de investidor para receber recomendações personalizadas
            </EmptyText>
          </EmptyState>
        </Card>
      </Container>
    );
  }

  const recommendedPortfolio = portfolioSimulationService.getRecommendedPortfolio(riskProfile);

  const toggleAsset = (assetName: string) => {
    const newExpanded = new Set(expandedAssets);
    if (newExpanded.has(assetName)) {
      newExpanded.delete(assetName);
    } else {
      newExpanded.add(assetName);
    }
    setExpandedAssets(newExpanded);
  };

  return (
    <Container>
      <Header>
        <Title>Sugestões da IA</Title>
        {onApplyRecommendation && (
          <Button
            title="Aplicar"
            onPress={() => onApplyRecommendation(recommendedPortfolio)}
            variant="gradient"
            size="small"
            icon={<Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          />
        )}
      </Header>

      {/* Carteira Recomendada */}
      <RecommendedPortfolioCard variant="elevated">
        <PortfolioHeader>
          <PortfolioIcon>
            <Ionicons name="bulb-outline" size={20} color="#8B5CF6" />
          </PortfolioIcon>
          <PortfolioTitle>Carteira Recomendada para {riskProfile}</PortfolioTitle>
        </PortfolioHeader>

        <DistributionList>
          {recommendedPortfolio.distribution.map((dist, index) => (
            <DistributionRow key={index}>
              <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
                <DistributionBar
                  percentage={dist.percentage}
                  color={categoryColors[dist.category] || '#8B5CF6'}
                />
                <Text style={{fontSize: 14, color: '#374151', marginLeft: 8}}>
                  {dist.category}
                </Text>
              </View>
              <Text style={{fontSize: 14, fontWeight: '600', color: '#374151', minWidth: 50, textAlign: 'right'}}>
                {formatPercentage(dist.percentage)}
              </Text>
            </DistributionRow>
          ))}
        </DistributionList>
      </RecommendedPortfolioCard>

      {/* Lista de Ativos Recomendados */}
      <AssetsList>
        <Text style={{fontSize: 16, fontWeight: '600', color: '#374151', marginBottom: 12}}>
          Ativos Recomendados
        </Text>
        {recommendedPortfolio.recommendedAssets.map((asset, index) => {
          const isExpanded = expandedAssets.has(asset.name);
          return (
            <AssetCard key={index} variant="elevated">
              <AssetHeader>
                <View style={{flex: 1}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap'}}>
                    <AssetName>{asset.name}</AssetName>
                    <Badge color={categoryColors[asset.category] || '#8B5CF6'}>
                      <BadgeText color={categoryColors[asset.category] || '#8B5CF6'}>
                        {asset.category}
                      </BadgeText>
                    </Badge>
                  </View>
                </View>
              </AssetHeader>

              <AssetInfo>
                <InfoItem>
                  <Ionicons name="shield-outline" size={14} color={riskColors[asset.risk]} />
                  <InfoText style={{color: riskColors[asset.risk]}}>Risco: {asset.risk}</InfoText>
                </InfoItem>
                <InfoItem>
                  <Ionicons name="cash-outline" size={14} color={liquidityColors[asset.liquidity]} />
                  <InfoText style={{color: liquidityColors[asset.liquidity]}}>Liquidez: {asset.liquidity}</InfoText>
                </InfoItem>
                <InfoItem>
                  <Ionicons name="trending-up-outline" size={14} color="#10B981" />
                  <InfoText style={{color: '#10B981'}}>
                    Rentabilidade: {formatPercentage(asset.expectedReturn)}
                  </InfoText>
                </InfoItem>
              </AssetInfo>

              <ExpandButton onPress={() => toggleAsset(asset.name)}>
                <Ionicons
                  name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                  size={16}
                  color="#8B5CF6"
                />
                <ExpandText>Ver Justificativa</ExpandText>
              </ExpandButton>

              {isExpanded && (
                <JustificationText>{asset.justification}</JustificationText>
              )}
            </AssetCard>
          );
        })}
      </AssetsList>
    </Container>
  );
};

export default AIRecommendations;


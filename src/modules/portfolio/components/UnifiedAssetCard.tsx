import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {Ionicons} from '@expo/vector-icons';
import {PortfolioItem, StockQuote, RecommendedAsset} from '../../../shared/types';
import {formatCurrency, formatPercentage} from '../../../shared/utils/formatters';

interface UnifiedAssetCardProps {
  item: PortfolioItem;
  asset?: RecommendedAsset;
  quote?: StockQuote;
  onRemove: () => void;
}

const CardContainer = styled.View`
  background-color: ${({theme}) => theme.colors.card};
  padding: ${({theme}) => theme.spacing.md}px;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  border-radius: ${({theme}) => theme.borderRadius.lg}px;
  position: relative;
  ${({theme}) => theme.shadows.lg}
`;

const RemoveButton = styled.TouchableOpacity`
  position: absolute;
  top: ${({theme}) => theme.spacing.sm}px;
  right: ${({theme}) => theme.spacing.sm}px;
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({theme}) => theme.colors.error}15;
  justify-content: center;
  align-items: center;
  z-index: 10;
  elevation: 5;
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  padding-right: ${({theme}) => theme.spacing.xl}px;
`;

const AssetInfo = styled.View`
  flex: 1;
`;

const AssetName = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 16px;
  font-weight: 600;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.h4.fontFamily};
`;

const AssetBadge = styled.View<{color: string}>`
  align-self: flex-start;
  background-color: ${({color}) => color}20;
  padding-horizontal: ${({theme}) => theme.spacing.xs}px;
  padding-vertical: 2px;
  border-radius: ${({theme}) => theme.borderRadius.sm}px;
  margin-top: ${({theme}) => theme.spacing.xs}px;
`;

const AssetBadgeText = styled.Text<{color: string}>`
  color: ${({color}) => color};
  font-size: 10px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const PriceContainer = styled.View`
  align-items: flex-end;
`;

const CurrentPrice = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 18px;
  font-weight: 700;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const ChangeContainer = styled.View<{isPositive: boolean}>`
  flex-direction: row;
  align-items: center;
  background-color: ${({theme, isPositive}) => 
    isPositive ? theme.colors.positive + '15' : theme.colors.negative + '15'};
  padding-horizontal: ${({theme}) => theme.spacing.xs}px;
  padding-vertical: 2px;
  border-radius: ${({theme}) => theme.borderRadius.sm}px;
`;

const ChangeText = styled.Text<{isPositive: boolean}>`
  color: ${({theme, isPositive}) => 
    isPositive ? theme.colors.positive : theme.colors.negative};
  font-size: 12px;
  font-weight: 600;
  margin-left: 2px;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const DetailsContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-top: ${({theme}) => theme.spacing.sm}px;
  padding-top: ${({theme}) => theme.spacing.sm}px;
  border-top-width: 1px;
  border-top-color: ${({theme}) => theme.colors.border};
`;

const DetailItem = styled.View`
  flex: 1;
`;

const DetailLabel = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 10px;
  font-weight: 500;
  margin-bottom: 2px;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const DetailValue = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 12px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const categoryColors: Record<string, string> = {
  'Renda Fixa': '#10B981',
  'Fundos': '#8B5CF6',
  'Renda Variável': '#EF4444',
};

const UnifiedAssetCard: React.FC<UnifiedAssetCardProps> = ({
  item,
  asset,
  quote,
  onRemove,
}) => {
  const itemValue = item.quantity && item.unitPrice
    ? item.quantity * item.unitPrice
    : item.amount;

  const category = asset?.category || (item.assetType as string) || 'Renda Variável';
  const categoryColor = categoryColors[category] || '#8B5CF6';

  // Se tiver quote, usar preço atual; senão usar unitPrice
  const currentPrice = quote?.price || item.unitPrice || 0;
  const changePercent = quote?.changePercent || 0;
  const isPositive = changePercent >= 0;

  // Calcular P&L se tiver quote e quantidade
  let profitLoss = 0;
  if (quote && item.quantity && item.unitPrice) {
    const currentValue = quote.price * item.quantity;
    const investedValue = item.unitPrice * item.quantity;
    profitLoss = currentValue - investedValue;
  }

  return (
    <CardContainer>
      <RemoveButton 
        onPress={onRemove} 
        activeOpacity={0.7}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
      >
        <Ionicons name="trash-outline" size={16} color="#EF4444" />
      </RemoveButton>

      <Header>
        <AssetInfo>
          <AssetName>{item.assetName}</AssetName>
          <AssetBadge color={categoryColor}>
            <AssetBadgeText color={categoryColor}>{category}</AssetBadgeText>
          </AssetBadge>
        </AssetInfo>

        <PriceContainer>
          <CurrentPrice>{formatCurrency(currentPrice)}</CurrentPrice>
          {quote && changePercent !== 0 && (
            <ChangeContainer isPositive={isPositive}>
              <Ionicons 
                name={isPositive ? 'trending-up' : 'trending-down'} 
                size={12} 
                color={isPositive ? '#10B981' : '#EF4444'} 
              />
              <ChangeText isPositive={isPositive}>
                {isPositive ? '+' : ''}{formatPercentage(changePercent)}
              </ChangeText>
            </ChangeContainer>
          )}
        </PriceContainer>
      </Header>

      <DetailsContainer>
        {item.quantity && (
          <DetailItem>
            <DetailLabel>Quantidade</DetailLabel>
            <DetailValue>{item.quantity.toFixed(2)}</DetailValue>
          </DetailItem>
        )}
        <DetailItem>
          <DetailLabel>Valor Total</DetailLabel>
          <DetailValue>{formatCurrency(itemValue)}</DetailValue>
        </DetailItem>
        {quote && profitLoss !== 0 && (
          <DetailItem>
            <DetailLabel>P&L</DetailLabel>
            <DetailValue style={{
              color: profitLoss >= 0 ? '#10B981' : '#EF4444'
            }}>
              {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss)}
            </DetailValue>
          </DetailItem>
        )}
        {quote?.volume && (
          <DetailItem>
            <DetailLabel>Volume</DetailLabel>
            <DetailValue style={{fontSize: 10}}>
              {quote.volume >= 1000000 
                ? `${(quote.volume / 1000000).toFixed(1)}M`
                : quote.volume >= 1000
                ? `${(quote.volume / 1000).toFixed(1)}K`
                : quote.volume.toString()}
            </DetailValue>
          </DetailItem>
        )}
      </DetailsContainer>
    </CardContainer>
  );
};

export default UnifiedAssetCard;


import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import styled from 'styled-components/native';
import {Ionicons} from '@expo/vector-icons';
import {StockQuote, StockPosition} from '../../../shared/types';
import {formatCurrency, formatPercentage} from '../../../shared/utils/formatters';
import Card from '../../../shared/components/Card';

interface StockCardProps {
  position: StockPosition;
  quote?: StockQuote;
  onPress?: () => void;
  loading?: boolean;
  lastUpdate?: Date | null;
}

const CardContainer = styled(TouchableOpacity)`
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const StockCardContainer = styled(Card)`
  padding: ${({theme}) => theme.spacing.md}px;
  ${({theme}) => theme.shadows.sm}
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const TickerContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;

const Ticker = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 16px;
  font-weight: 600;
  margin-right: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.h4.fontFamily};
`;

const TickerBadge = styled.View<{type: string}>`
  background-color: ${({theme, type}) => {
    switch (type) {
      case 'Ação': return theme.colors.primary + '20';
      case 'FII': return theme.colors.secondary + '20';
      case 'ETF': return theme.colors.accent + '20';
      default: return theme.colors.neutral + '20';
    }
  }};
  padding-horizontal: ${({theme}) => theme.spacing.xs}px;
  padding-vertical: 2px;
  border-radius: ${({theme}) => theme.borderRadius.sm}px;
`;

const TickerBadgeText = styled.Text<{type: string}>`
  color: ${({theme, type}) => {
    switch (type) {
      case 'Ação': return theme.colors.primary;
      case 'FII': return theme.colors.secondary;
      case 'ETF': return theme.colors.accent;
      default: return theme.colors.neutral;
    }
  }};
  font-size: 10px;
  font-weight: 500;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const PriceContainer = styled.View`
  align-items: flex-end;
`;

const CurrentPrice = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 18px;
  font-weight: 700;
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
  margin-top: ${({theme}) => theme.spacing.xs}px;
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
`;

const DetailItem = styled.View`
  flex: 1;
  align-items: center;
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

const LoadingContainer = styled.View`
  padding: ${({theme}) => theme.spacing.lg}px;
  align-items: center;
`;

const LoadingText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 14px;
  margin-top: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const MiniChart = styled.View`
  height: 30px;
  width: 60px;
  background-color: ${({theme}) => theme.colors.background};
  border-radius: ${({theme}) => theme.borderRadius.sm}px;
  justify-content: center;
  align-items: center;
  margin-left: ${({theme}) => theme.spacing.sm}px;
`;

const ChartPlaceholder = styled.View<{isPositive: boolean}>`
  width: 40px;
  height: 20px;
  background-color: ${({theme, isPositive}) => 
    isPositive ? theme.colors.positive + '20' : theme.colors.negative + '20'};
  border-radius: 2px;
  justify-content: center;
  align-items: center;
`;

const ChartIcon = styled(Ionicons)<{isPositive: boolean}>`
  color: ${({theme, isPositive}) => 
    isPositive ? theme.colors.positive : theme.colors.negative};
`;

const LastUpdateText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 10px;
  text-align: right;
  margin-top: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const VolumeText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 10px;
  font-family: ${({theme}) => theme.typography.small.fontFamily};
`;

const formatVolume = (volume: number): string => {
  if (volume >= 1000000000) {
    return `${(volume / 1000000000).toFixed(1)}B`;
  }
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`;
  }
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`;
  }
  return volume.toString();
};

const formatLastUpdate = (date: Date | null) => {
  if (!date) return '';
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Agora';
  if (diffInMinutes < 60) return `${diffInMinutes}min`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
};

const StockCard: React.FC<StockCardProps> = ({
  position,
  quote,
  onPress,
  loading = false,
  lastUpdate,
}) => {
  if (loading) {
    return (
      <CardContainer disabled>
        <StockCardContainer>
          <LoadingContainer>
            <Ionicons name="trending-up-outline" size={24} color="#8B5CF6" />
            <LoadingText>Carregando cotação...</LoadingText>
          </LoadingContainer>
        </StockCardContainer>
      </CardContainer>
    );
  }

  const currentPrice = quote?.price || position.currentPrice;
  const change = quote?.change || position.change;
  const changePercent = quote?.changePercent || position.changePercent;
  const isPositive = change >= 0;

  const getAssetType = (ticker: string): string => {
    if (ticker.includes('11') || ticker.includes('FII')) return 'FII';
    if (ticker.includes('BOVA') || ticker.includes('SMAL')) return 'ETF';
    return 'Ação';
  };

  const assetType = getAssetType(position.ticker);

  return (
    <CardContainer onPress={onPress} disabled={!onPress}>
      <StockCardContainer variant="elevated">
        <Header>
          <TickerContainer>
            <Ticker>{position.ticker}</Ticker>
            <TickerBadge type={assetType}>
              <TickerBadgeText type={assetType}>{assetType}</TickerBadgeText>
            </TickerBadge>
          </TickerContainer>
          
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <PriceContainer>
              <CurrentPrice>{formatCurrency(currentPrice)}</CurrentPrice>
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
            </PriceContainer>
            
            <MiniChart>
              <ChartPlaceholder isPositive={isPositive}>
                <ChartIcon 
                  name={isPositive ? 'trending-up' : 'trending-down'} 
                  size={16} 
                  isPositive={isPositive}
                />
              </ChartPlaceholder>
            </MiniChart>
          </View>
        </Header>

        <DetailsContainer>
          <DetailItem>
            <DetailLabel>Quantidade</DetailLabel>
            <DetailValue>{position.quantity}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>Valor Total</DetailLabel>
            <DetailValue>{formatCurrency(position.totalValue)}</DetailValue>
          </DetailItem>
          <DetailItem>
            <DetailLabel>P&L</DetailLabel>
            <DetailValue style={{
              color: position.profitLoss >= 0 ? '#10B981' : '#EF4444'
            }}>
              {position.profitLoss >= 0 ? '+' : ''}{formatCurrency(position.profitLoss)}
            </DetailValue>
          </DetailItem>
          {quote?.volume && (
            <DetailItem>
              <DetailLabel>Volume</DetailLabel>
              <VolumeText>{formatVolume(quote.volume)}</VolumeText>
            </DetailItem>
          )}
        </DetailsContainer>
        
        {lastUpdate && (
          <LastUpdateText>
            Atualizado: {formatLastUpdate(lastUpdate)}
          </LastUpdateText>
        )}
      </StockCardContainer>
    </CardContainer>
  );
};

export default StockCard;

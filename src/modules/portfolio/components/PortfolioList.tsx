import React from 'react';
import {FlatList, Text} from 'react-native';
import styled from 'styled-components/native';
import {PortfolioItem} from '../../../shared/types';
import {formatCurrency} from '../../../shared/utils/formatters';
import Card from '../../../shared/components/Card';

interface PortfolioListProps {
  items: PortfolioItem[];
  totalValue: number;
}

const ListContainer = styled.View`
  flex: 1;
`;

const TotalCard = styled(Card)`
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
  align-items: center;
`;

const TotalLabel = styled.Text`
  color: ${({theme}) => theme.colors.textMuted};
  font-size: 14px;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.caption.fontFamily};
`;

const TotalValue = styled.Text`
  color: ${({theme}) => theme.colors.text};
  font-size: 28px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h2.fontFamily};
`;

const ItemCard = styled(Card)`
  margin-bottom: ${({theme}) => theme.spacing.md}px;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const ItemInfo = styled.View`
  flex: 1;
`;

const ItemName = styled.Text`
  color: ${({theme}) => theme.colors.text};
  font-size: 16px;
  font-weight: 600;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const ItemType = styled.Text`
  color: ${({theme}) => theme.colors.textMuted};
  font-size: 14px;
  font-family: ${({theme}) => theme.typography.caption.fontFamily};
`;

const ItemValue = styled.Text`
  color: ${({theme}) => theme.colors.primary};
  font-size: 18px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const EmptyContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({theme}) => theme.spacing.xl}px;
`;

const EmptyText = styled.Text`
  color: ${({theme}) => theme.colors.textMuted};
  font-size: 16px;
  text-align: center;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const PortfolioList: React.FC<PortfolioListProps> = ({items, totalValue}) => {
  const renderItem = ({item}: {item: PortfolioItem}) => (
    <ItemCard variant="elevated">
      <ItemInfo>
        <ItemName>{item.assetName}</ItemName>
        <ItemType>{item.assetType}</ItemType>
      </ItemInfo>
      <ItemValue>{formatCurrency(item.amount)}</ItemValue>
    </ItemCard>
  );

  if (items.length === 0) {
    return (
      <ListContainer>
        <TotalCard variant="elevated">
          <TotalLabel>Valor Total do Portfólio</TotalLabel>
          <TotalValue>{formatCurrency(totalValue)}</TotalValue>
        </TotalCard>
        <EmptyContainer>
          <EmptyText>Nenhum investimento encontrado</EmptyText>
        </EmptyContainer>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <TotalCard variant="elevated">
        <TotalLabel>Valor Total do Portfólio</TotalLabel>
        <TotalValue>{formatCurrency(totalValue)}</TotalValue>
      </TotalCard>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </ListContainer>
  );
};

export default PortfolioList;

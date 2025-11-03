import React, {useState} from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import styled from 'styled-components/native';
import {Ionicons} from '@expo/vector-icons';
import {RecommendedAsset, AssetCategory} from '../../../shared/types';
import {formatCurrency, formatPercentage} from '../../../shared/utils/formatters';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import {portfolioSimulationService} from '../services/portfolioSimulationService';

interface AssetSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (assetName: string, quantity: number, unitPrice: number) => void;
}

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: flex-end;
`;

const ModalContent = styled.View`
  background-color: ${({theme}) => theme.colors.surface};
  border-top-left-radius: 20px;
  border-top-right-radius: 20px;
  max-height: 80%;
  padding: ${({theme}) => theme.spacing.lg}px;
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
`;

const ModalTitle = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 20px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const CloseButton = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({theme}) => theme.colors.border};
  justify-content: center;
  align-items: center;
`;

const SearchInput = styled.TextInput`
  height: 44px;
  background-color: ${({theme}) => theme.colors.background};
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  padding: ${({theme}) => theme.spacing.sm}px ${({theme}) => theme.spacing.md}px;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
  color: ${({theme}) => theme.colors.textDark};
  font-size: 14px;
`;

const CategoryFilter = styled.ScrollView`
  margin-bottom: ${({theme}) => theme.spacing.md}px;
`;

const CategoryButton = styled.TouchableOpacity<{active: boolean}>`
  padding: ${({theme}) => theme.spacing.sm}px ${({theme}) => theme.spacing.md}px;
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  margin-right: ${({theme}) => theme.spacing.sm}px;
  background-color: ${({active, theme}) =>
    active ? theme.colors.primary : theme.colors.background};
  border-width: 1px;
  border-color: ${({active, theme}) =>
    active ? theme.colors.primary : theme.colors.border};
`;

const CategoryButtonText = styled.Text<{active: boolean}>`
  color: ${({active, theme}) =>
    active ? '#FFFFFF' : theme.colors.textDark};
  font-size: 13px;
  font-weight: 500;
`;

const AssetsList = styled.ScrollView`
  max-height: 300px;
`;

const AssetItem = styled(Card)`
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

const AssetBadge = styled.View<{color: string}>`
  background-color: ${({color}) => color}20;
  padding: 4px 8px;
  border-radius: 4px;
  margin-left: 8px;
`;

const AssetBadgeText = styled.Text<{color: string}>`
  color: ${({color}) => color};
  font-size: 11px;
  font-weight: 600;
`;

const AssetDetails = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: ${({theme}) => theme.spacing.xs}px;
  gap: 8px;
`;

const DetailItem = styled.View`
  flex-direction: row;
  align-items: center;
`;

const DetailText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 11px;
  margin-left: 4px;
`;

const InputSection = styled.View`
  margin-top: ${({theme}) => theme.spacing.md}px;
  padding-top: ${({theme}) => theme.spacing.md}px;
  border-top-width: 1px;
  border-top-color: ${({theme}) => theme.colors.border};
`;

const InputLabel = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 14px;
  font-weight: 600;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const InputRow = styled.View`
  flex-direction: row;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

const StyledInput = styled.TextInput`
  flex: 1;
  height: 44px;
  background-color: ${({theme}) => theme.colors.background};
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  padding: ${({theme}) => theme.spacing.sm}px ${({theme}) => theme.spacing.md}px;
  color: ${({theme}) => theme.colors.textDark};
  font-size: 14px;
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
`;

const PreviewCard = styled(Card)`
  margin-top: ${({theme}) => theme.spacing.md}px;
  padding: ${({theme}) => theme.spacing.md}px;
  background-color: ${({theme}) => theme.colors.primary}10;
`;

const PreviewText = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 13px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const PreviewValue = styled.Text`
  color: ${({theme}) => theme.colors.primary};
  font-size: 18px;
  font-weight: 700;
  margin-top: 4px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const categoryColors: Record<string, string> = {
  'Renda Fixa': '#10B981',
  'Fundos': '#8B5CF6',
  'Renda Variável': '#EF4444',
};

const categories: AssetCategory[] = ['Renda Fixa', 'Fundos', 'Renda Variável'];

const AssetSelector: React.FC<AssetSelectorProps> = ({
  visible,
  onClose,
  onSelect,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<RecommendedAsset | null>(null);
  const [quantity, setQuantity] = useState('');
  const [unitPrice, setUnitPrice] = useState('');

  const allAssets = portfolioSimulationService.getAllAssets();

  const filteredAssets = allAssets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || asset.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectAsset = (asset: RecommendedAsset) => {
    setSelectedAsset(asset);
    setQuantity('');
    setUnitPrice('');
  };

  const handleConfirm = () => {
    if (!selectedAsset) {
      Alert.alert('Erro', 'Selecione um ativo primeiro');
      return;
    }

    const qty = parseFloat(quantity);
    const price = parseFloat(unitPrice);

    if (isNaN(qty) || qty <= 0) {
      Alert.alert('Erro', 'Informe uma quantidade válida');
      return;
    }

    if (isNaN(price) || price <= 0) {
      Alert.alert('Erro', 'Informe um preço unitário válido');
      return;
    }

    onSelect(selectedAsset.name, qty, price);
    handleClose();
  };

  const handleClose = () => {
    setSelectedAsset(null);
    setQuantity('');
    setUnitPrice('');
    setSearchQuery('');
    setSelectedCategory(null);
    onClose();
  };

  const totalValue = selectedAsset && quantity && unitPrice
    ? parseFloat(quantity) * parseFloat(unitPrice)
    : 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}>
      <ModalContainer>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Adicionar Ativo</ModalTitle>
            <CloseButton onPress={handleClose}>
              <Ionicons name="close" size={20} color="#374151" />
            </CloseButton>
          </ModalHeader>

          {!selectedAsset ? (
            <>
              <SearchInput
                placeholder="Buscar ativo..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />

              <CategoryFilter horizontal showsHorizontalScrollIndicator={false}>
                <CategoryButton
                  active={selectedCategory === null}
                  onPress={() => setSelectedCategory(null)}>
                  <CategoryButtonText active={selectedCategory === null}>
                    Todos
                  </CategoryButtonText>
                </CategoryButton>
                {categories.map(cat => (
                  <CategoryButton
                    key={cat}
                    active={selectedCategory === cat}
                    onPress={() => setSelectedCategory(cat)}>
                    <CategoryButtonText active={selectedCategory === cat}>
                      {cat}
                    </CategoryButtonText>
                  </CategoryButton>
                ))}
              </CategoryFilter>

              <AssetsList>
                {filteredAssets.map((asset, index) => (
                  <AssetItem
                    key={index}
                    variant="elevated"
                    onPress={() => handleSelectAsset(asset)}>
                    <AssetHeader>
                      <AssetName>{asset.name}</AssetName>
                      <AssetBadge color={categoryColors[asset.category] || '#8B5CF6'}>
                        <AssetBadgeText color={categoryColors[asset.category] || '#8B5CF6'}>
                          {asset.category}
                        </AssetBadgeText>
                      </AssetBadge>
                    </AssetHeader>
                    <AssetDetails>
                      <DetailItem>
                        <Ionicons name="shield-outline" size={12} color="#6B7280" />
                        <DetailText>Risco: {asset.risk}</DetailText>
                      </DetailItem>
                      <DetailItem>
                        <Ionicons name="cash-outline" size={12} color="#6B7280" />
                        <DetailText>Liquidez: {asset.liquidity}</DetailText>
                      </DetailItem>
                      <DetailItem>
                        <Ionicons name="trending-up-outline" size={12} color="#10B981" />
                        <DetailText>
                          Rent.: {formatPercentage(asset.expectedReturn)}
                        </DetailText>
                      </DetailItem>
                    </AssetDetails>
                  </AssetItem>
                ))}
              </AssetsList>
            </>
          ) : (
            <ScrollView>
              <Card variant="elevated" padding>
                <AssetHeader>
                  <AssetName>{selectedAsset.name}</AssetName>
                  <AssetBadge color={categoryColors[selectedAsset.category] || '#8B5CF6'}>
                    <AssetBadgeText color={categoryColors[selectedAsset.category] || '#8B5CF6'}>
                      {selectedAsset.category}
                    </AssetBadgeText>
                  </AssetBadge>
                </AssetHeader>
                <Text style={{fontSize: 13, color: '#6B7280', marginTop: 8}}>
                  {selectedAsset.justification}
                </Text>
              </Card>

              <InputSection>
                <InputLabel>Quantidade</InputLabel>
                <StyledInput
                  placeholder="Ex: 100"
                  keyboardType="numeric"
                  value={quantity}
                  onChangeText={setQuantity}
                />

                <InputLabel style={{marginTop: 12}}>Preço Unitário (R$)</InputLabel>
                <StyledInput
                  placeholder="Ex: 50.00"
                  keyboardType="numeric"
                  value={unitPrice}
                  onChangeText={setUnitPrice}
                />

                {totalValue > 0 && (
                  <PreviewCard variant="elevated">
                    <PreviewText>Valor Total a Investir</PreviewText>
                    <PreviewValue>{formatCurrency(totalValue)}</PreviewValue>
                  </PreviewCard>
                )}

                <View style={{flexDirection: 'row', gap: 12, marginTop: 16}}>
                  <Button
                    title="Voltar"
                    onPress={() => setSelectedAsset(null)}
                    variant="secondary"
                    size="medium"
                    style={{flex: 1}}
                  />
                  <Button
                    title="Adicionar"
                    onPress={handleConfirm}
                    variant="gradient"
                    size="medium"
                    style={{flex: 1}}
                    icon={<Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  />
                </View>
              </InputSection>
            </ScrollView>
          )}
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default AssetSelector;


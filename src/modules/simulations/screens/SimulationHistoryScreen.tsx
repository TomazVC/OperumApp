import React, {useState, useCallback} from 'react';
import {FlatList, RefreshControl, View} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {RootStackNavigationProp} from '../../../core/navigation/types';
import Container from '../../../shared/components/Container';
import Button from '../../../shared/components/Button';

const HeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${({theme}) => theme.spacing.lg}px;
  background-color: ${({theme}) => theme.colors.surface};
  ${({theme}) => theme.shadows.sm}
`;

const Title = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 20px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const ListContainer = styled.View`
  flex: 1;
  padding: ${({theme}) => theme.spacing.lg}px;
`;

const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${({theme}) => theme.spacing.xl}px;
`;

const EmptyText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 16px;
  text-align: center;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const SimulationHistoryScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const [refreshing, setRefreshing] = useState(false);
  const [items] = useState<any[]>([]);

  const onBack = () => navigation.goBack();

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // TODO: load simulations
    setRefreshing(false);
  }, []);

  return (
    <Container>
      <HeaderContainer>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <Button
            title=""
            onPress={onBack}
            variant="translucent"
            size="small"
            icon={<Ionicons name="arrow-back" size={18} color="#8B5CF6" />}
            style={{width: 40}}
          />
          <Title style={{marginLeft: 8}}>Histórico de Simulações</Title>
        </View>
      </HeaderContainer>

      <ListContainer>
        {items.length === 0 ? (
          <EmptyState>
            <Ionicons name="time-outline" size={40} color="#9CA3AF" />
            <EmptyText>
              Salve suas simulações para revisitar aqui
            </EmptyText>
          </EmptyState>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={() => null}
          />
        )}
      </ListContainer>
    </Container>
  );
};

export default SimulationHistoryScreen;



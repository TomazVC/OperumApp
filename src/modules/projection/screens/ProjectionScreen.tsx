import React, {useState, useEffect, useCallback} from 'react';
import {View, ScrollView, RefreshControl} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {RootStackNavigationProp} from '../../../core/navigation/types';
import {useAuth} from '../../../shared/hooks/useAuth';
import {PortfolioItem} from '../../../shared/types';
import {portfolioService} from '../../portfolio/services/portfolioService';
import {portfolioSimulationService} from '../../portfolio/services/portfolioSimulationService';
import FinancialSimulation from '../components/FinancialSimulation';
import Container from '../../../shared/components/Container';

const ScreenContainer = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background};
`;

const Header = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${({theme}) => theme.spacing.lg}px;
  background-color: ${({theme}) => theme.colors.surface};
  ${({theme}) => theme.shadows.sm}
`;

const Title = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 24px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h2.fontFamily};
`;

const LoadingContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({theme}) => theme.spacing.xl}px;
`;

const LoadingText = styled.Text`
  color: ${({theme}) => theme.colors.textSecondary};
  font-size: 16px;
  margin-top: ${({theme}) => theme.spacing.md}px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const ErrorContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: ${({theme}) => theme.spacing.xl}px;
`;

const ErrorText = styled.Text`
  color: ${({theme}) => theme.colors.error};
  font-size: 16px;
  margin-top: ${({theme}) => theme.spacing.md}px;
  text-align: center;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const Content = styled(ScrollView)`
  flex: 1;
`;

const ProjectionScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {user} = useAuth();
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [expectedReturn, setExpectedReturn] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPortfolioData = useCallback(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Buscar itens da carteira
      const items = portfolioService.getUserPortfolio(user.id);

      // Se não há itens, criar portfólio padrão
      if (items.length === 0) {
        portfolioService.createDefaultPortfolio(user.id);
        const defaultItems = portfolioService.getUserPortfolio(user.id);
        setPortfolioItems(defaultItems);
      } else {
        setPortfolioItems(items);
      }

      // Calcular retorno esperado da carteira
      // Usar apenas itens simulados (isDemo = 1) se existirem, senão usar todos
      const simulatedItems = items.filter(item => item.isDemo === 1);
      const itemsToCalculate = simulatedItems.length > 0 ? simulatedItems : items;

      if (itemsToCalculate.length > 0) {
        const metrics = portfolioSimulationService.calculatePortfolioMetrics(
          user.id,
          itemsToCalculate
        );
        setExpectedReturn(metrics.expectedReturn || 10);
      } else {
        // Valor padrão se não houver carteira
        setExpectedReturn(10);
      }
    } catch (err) {
      console.error('Erro ao carregar dados do portfólio:', err);
      setError('Não foi possível carregar os dados da carteira');
      setExpectedReturn(10); // Valor padrão em caso de erro
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadPortfolioData();
  }, [loadPortfolioData]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadPortfolioData();
    setRefreshing(false);
  }, [loadPortfolioData]);


  if (isLoading) {
    return (
      <ScreenContainer>
        <Header>
          <Title>Projeção Financeira</Title>
        </Header>
        <LoadingContainer>
          <Ionicons name="trending-up-outline" size={48} color="#8B5CF6" />
          <LoadingText>Carregando dados da carteira...</LoadingText>
        </LoadingContainer>
      </ScreenContainer>
    );
  }

  if (error) {
    return (
      <ScreenContainer>
        <Header>
          <Title>Projeção Financeira</Title>
        </Header>
        <ErrorContainer>
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <ErrorText>{error}</ErrorText>
        </ErrorContainer>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header>
        <Title>Projeção Financeira</Title>
      </Header>
      <FinancialSimulation portfolioExpectedReturn={expectedReturn} />
    </ScreenContainer>
  );
};

export default ProjectionScreen;

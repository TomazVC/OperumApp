import React from 'react';
import {View, Text, ScrollView} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {RootStackNavigationProp} from '../../../core/navigation/types';
import Button from '../../../shared/components/Button';
import GradientBackground from '../../../shared/components/GradientBackground';
import TranslucentCard from '../../../shared/components/TranslucentCard';

const ScreenContainer = styled.View`
  flex: 1;
`;

const HeaderContainer = styled.View`
  padding: ${({theme}) => theme.spacing.xl}px ${({theme}) => theme.spacing.lg}px;
  align-items: center;
`;

const Logo = styled.Text`
  color: ${({theme}) => theme.colors.textLight};
  font-size: 36px;
  font-weight: 700;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.h1.fontFamily};
`;

const Subtitle = styled.Text`
  color: ${({theme}) => theme.colors.textMuted};
  font-size: 16px;
  text-align: center;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const ContentContainer = styled.View`
  flex: 1;
  padding: ${({theme}) => theme.spacing.lg}px;
  justify-content: center;
`;

const FeatureCard = styled(TranslucentCard)`
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
  flex-direction: row;
  align-items: center;
`;

const IconContainer = styled.View`
  width: 60px;
  height: 60px;
  border-radius: 30px;
  background-color: rgba(255, 255, 255, 0.2);
  justify-content: center;
  align-items: center;
  margin-right: ${({theme}) => theme.spacing.lg}px;
`;

const FeatureContent = styled.View`
  flex: 1;
`;

const FeatureTitle = styled.Text`
  color: ${({theme}) => theme.colors.textLight};
  font-size: 18px;
  font-weight: 600;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const FeatureDescription = styled.Text`
  color: ${({theme}) => theme.colors.textMuted};
  font-size: 14px;
  line-height: 20px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const ButtonContainer = styled.View`
  padding: ${({theme}) => theme.spacing.xl}px ${({theme}) => theme.spacing.lg}px;
  align-items: center;
`;

const FooterText = styled.Text`
  color: ${({theme}) => theme.colors.textMuted};
  font-size: 14px;
  text-align: center;
  margin-top: ${({theme}) => theme.spacing.md}px;
  font-family: ${({theme}) => theme.typography.caption.fontFamily};
`;

const features = [
  {
    title: 'IA Explicável',
    description: 'Entenda cada recomendação de investimento',
    icon: 'bulb-outline',
  },
  {
    title: 'Carteiras Personalizadas',
    description: 'Sugestões alinhadas ao seu perfil e objetivos',
    icon: 'trending-up-outline',
  },
  {
    title: 'Seguro e Transparente',
    description: 'Seus dados protegidos com conformidade LGPD',
    icon: 'shield-checkmark-outline',
  },
];

const OnboardingScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();

  const handleGetStarted = () => {
    navigation.navigate('Login');
  };

  return (
    <GradientBackground variant="primary">
      <ScreenContainer>
        <HeaderContainer>
          <Logo>Operum</Logo>
          <Subtitle>Seu assessor virtual de investimentos</Subtitle>
        </HeaderContainer>

        <ContentContainer>
          <ScrollView showsVerticalScrollIndicator={false}>
            {features.map((feature, index) => (
              <FeatureCard key={index} variant="elevated">
                <IconContainer>
                  <Ionicons 
                    name={feature.icon as any} 
                    size={28} 
                    color="#FFFFFF" 
                  />
                </IconContainer>
                <FeatureContent>
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureDescription>{feature.description}</FeatureDescription>
                </FeatureContent>
              </FeatureCard>
            ))}
          </ScrollView>
        </ContentContainer>

        <ButtonContainer>
          <Button
            title="Começar agora"
            onPress={handleGetStarted}
            variant="white"
            size="large"
            icon={<Ionicons name="arrow-forward" size={20} color="#8B5CF6" />}
          />
          <FooterText>
            Investir com inteligência nunca foi tão fácil
          </FooterText>
        </ButtonContainer>
      </ScreenContainer>
    </GradientBackground>
  );
};

export default OnboardingScreen;

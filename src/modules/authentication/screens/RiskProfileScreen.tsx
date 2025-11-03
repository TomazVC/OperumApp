import React, {useState} from 'react';
import {View, Text, ScrollView, Animated} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {RootStackNavigationProp, RootStackParamList} from '../../../core/navigation/types';
import Button from '../../../shared/components/Button';
import GradientBackground from '../../../shared/components/GradientBackground';
import Card from '../../../shared/components/Card';
import {riskQuestions, calculateRiskProfile, getRiskProfileDescription, RiskProfileAnswers} from '../services/riskProfileService';
import {updateUser} from '../../../core/database';

type RiskProfileRouteProp = RouteProp<RootStackParamList, 'RiskProfile'>;

const ScreenContainer = styled.View`
  flex: 1;
`;

const ProgressContainer = styled.View`
  padding: ${({theme}) => theme.spacing.lg}px ${({theme}) => theme.spacing.lg}px 0;
  align-items: center;
`;

const ProgressText = styled.Text`
  color: ${({theme}) => theme.colors.textLight};
  font-size: 16px;
  font-weight: 600;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const ProgressBar = styled.View`
  width: 100%;
  height: 4px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  overflow: hidden;
`;

const ProgressFill = styled.View<{width: number}>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: ${({theme}) => theme.colors.primary};
  border-radius: 2px;
`;

const ContentContainer = styled.View`
  flex: 1;
  padding: ${({theme}) => theme.spacing.xl}px ${({theme}) => theme.spacing.lg}px;
  justify-content: center;
`;

const QuestionCard = styled(Card)`
  width: 100%;
  margin-bottom: ${({theme}) => theme.spacing.xl}px;
  ${({theme}) => theme.shadows.lg}
`;

const QuestionTitle = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 24px;
  font-weight: 700;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  font-family: ${({theme}) => theme.typography.h2.fontFamily};
`;

const QuestionSubtitle = styled.Text`
  color: ${({theme}) => theme.colors.textMuted};
  font-size: 16px;
  margin-bottom: ${({theme}) => theme.spacing.xl}px;
  line-height: 22px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const OptionsContainer = styled.View`
  gap: ${({theme}) => theme.spacing.md}px;
`;

const OptionCard = styled.TouchableOpacity<{selected: boolean}>`
  background-color: ${props => props.selected ? props.theme.colors.primary + '15' : '#FFFFFF'};
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : '#E5E7EB'};
  border-radius: 12px;
  padding: ${({theme}) => theme.spacing.lg}px;
  flex-direction: row;
  align-items: center;
  ${({theme}) => theme.shadows.sm}
`;

const RadioButton = styled.View<{selected: boolean}>`
  width: 20px;
  height: 20px;
  border-radius: 10px;
  border: 2px solid ${props => props.selected ? props.theme.colors.primary : '#9CA3AF'};
  background-color: ${props => props.selected ? props.theme.colors.primary : 'transparent'};
  margin-right: ${({theme}) => theme.spacing.md}px;
  justify-content: center;
  align-items: center;
`;

const RadioInner = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: #FFFFFF;
`;

const OptionText = styled.Text<{selected: boolean}>`
  flex: 1;
  color: ${props => props.selected ? props.theme.colors.primary : props.theme.colors.textDark};
  font-size: 16px;
  font-weight: ${props => props.selected ? '600' : '400'};
  line-height: 22px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const ButtonContainer = styled.View`
  padding: ${({theme}) => theme.spacing.xl}px ${({theme}) => theme.spacing.lg}px;
  align-items: center;
`;

const RiskProfileScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const route = useRoute<RiskProfileRouteProp>();
  const {userId} = route.params;

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<RiskProfileAnswers>({});
  const [fadeAnim] = useState(new Animated.Value(1));

  const currentQuestion = riskQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === riskQuestions.length - 1;
  const progress = ((currentQuestionIndex + 1) / riskQuestions.length) * 100;

  const handleOptionSelect = (optionValue: number) => {
    const newAnswers = {
      ...answers,
      [currentQuestion.id]: optionValue
    };
    setAnswers(newAnswers);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      // Calcular perfil final
      const riskProfile = calculateRiskProfile(answers);
      const objectives = Object.keys(answers).join(', ');
      
      try {
        // Atualizar usuário no banco
        updateUser(userId, {
          riskProfile,
          objectives
        });
        
        console.log('✅ Perfil de risco salvo:', { riskProfile, objectives });
        
        // Navegar para Main (abas)
        navigation.replace('Main');
      } catch (error) {
        console.error('Erro ao salvar perfil:', error);
        // Mesmo com erro, navegar para Main (abas)
        navigation.replace('Main');
      }
    } else {
      // Animar transição para próxima pergunta
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const isNextDisabled = !answers[currentQuestion.id];

  return (
    <GradientBackground variant="primary">
      <ScreenContainer>
        <ProgressContainer>
          <ProgressText>Pergunta {currentQuestionIndex + 1} de {riskQuestions.length}</ProgressText>
          <ProgressBar>
            <ProgressFill width={progress} />
          </ProgressBar>
        </ProgressContainer>

        <ContentContainer>
          <Animated.View style={{opacity: fadeAnim}}>
            <QuestionCard>
              <QuestionTitle>{currentQuestion.question}</QuestionTitle>
              <QuestionSubtitle>{currentQuestion.subtitle}</QuestionSubtitle>
              
              <OptionsContainer>
                {currentQuestion.options.map((option) => {
                  const isSelected = answers[currentQuestion.id] === option.value;
                  return (
                    <OptionCard
                      key={option.id}
                      selected={isSelected}
                      onPress={() => handleOptionSelect(option.value)}
                      activeOpacity={0.7}
                    >
                      <RadioButton selected={isSelected}>
                        {isSelected && <RadioInner />}
                      </RadioButton>
                      <OptionText selected={isSelected}>
                        {option.text}
                      </OptionText>
                    </OptionCard>
                  );
                })}
              </OptionsContainer>
            </QuestionCard>
          </Animated.View>
        </ContentContainer>

        <ButtonContainer>
          <Button
            title={isLastQuestion ? "Finalizar" : "Próxima"}
            onPress={handleNext}
            disabled={isNextDisabled}
            variant="gradient"
            size="large"
            icon={!isLastQuestion ? <Ionicons name="arrow-forward" size={20} color="#FFFFFF" /> : undefined}
          />
        </ButtonContainer>
      </ScreenContainer>
    </GradientBackground>
  );
};

export default RiskProfileScreen;

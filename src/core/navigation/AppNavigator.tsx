import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import OnboardingScreen from '../../modules/authentication/screens/OnboardingScreen';
import LoginScreen from '../../modules/authentication/screens/LoginScreen';
import RegisterScreen from '../../modules/authentication/screens/RegisterScreen';
import RiskProfileScreen from '../../modules/authentication/screens/RiskProfileScreen';
import ChatbotScreen from '../../modules/chatbot/screens/ChatbotScreen';
import SimulationHistoryScreen from '../../modules/simulations/screens/SimulationHistoryScreen';
import {RootStackParamList} from './types';
import MainTabs from './MainTabs';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => (
  <Stack.Navigator screenOptions={{headerShown: false}}>
    <Stack.Screen name="Onboarding" component={OnboardingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="RiskProfile" component={RiskProfileScreen} />
    <Stack.Screen name="Main" component={MainTabs} />
    <Stack.Screen name="SimulationHistory" component={SimulationHistoryScreen} />
    <Stack.Screen name="Chatbot" component={ChatbotScreen} />
  </Stack.Navigator>
);

export default AppNavigator;

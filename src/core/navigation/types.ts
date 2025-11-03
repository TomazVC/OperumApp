export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  RiskProfile: { userId: number };
  Main: undefined;
  SimulationHistory: undefined;
  Chatbot: undefined;
};

export type RootStackNavigationProp = import('@react-navigation/native-stack').NativeStackNavigationProp<RootStackParamList>;

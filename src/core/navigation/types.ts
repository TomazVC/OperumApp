export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Register: undefined;
  RiskProfile: { userId: number };
  Portfolio: undefined;
  Chatbot: undefined;
};

export type RootStackNavigationProp = import('@react-navigation/native-stack').NativeStackNavigationProp<RootStackParamList>;

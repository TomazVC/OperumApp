import React from 'react';
import {SafeAreaView, StatusBar, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {ThemeProvider} from 'styled-components/native';
import AppNavigator from './src/core/navigation/AppNavigator';
import {AuthProvider} from './src/shared/hooks/useAuth';
import theme from './src/shared/theme/theme';

const App: React.FC = () => (
  <ThemeProvider theme={theme}>
    <AuthProvider>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor={theme.colors.background}
          translucent={false}
        />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </SafeAreaView>
    </AuthProvider>
  </ThemeProvider>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default App;

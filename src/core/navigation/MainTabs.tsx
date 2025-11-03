import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Ionicons} from '@expo/vector-icons';
import PortfolioScreen from '../../modules/portfolio/screens/PortfolioScreen';
import ProjectionScreen from '../../modules/projection/screens/ProjectionScreen';
import SettingsScreen from '../../modules/settings/screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const MainTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: '#8B5CF6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          borderTopWidth: 0,
          elevation: 12,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: '#FFFFFF',
        },
        tabBarIcon: ({color, size}) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';
          if (route.name === 'Carteira') iconName = 'wallet-outline';
          if (route.name === 'Projeção') iconName = 'trending-up-outline';
          if (route.name === 'Config') iconName = 'settings-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Carteira" component={PortfolioScreen} />
      <Tab.Screen name="Projeção" component={ProjectionScreen} />
      <Tab.Screen name="Config" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

export default MainTabs;



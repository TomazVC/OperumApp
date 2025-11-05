import React, {useState, useEffect, useCallback} from 'react';
import {View, ScrollView, Alert, RefreshControl, Text} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {RootStackNavigationProp} from '../../../core/navigation/types';
import {useAuth} from '../../../shared/hooks/useAuth';
import {RiskProfile} from '../../../shared/types';
import {getUserById} from '../../../core/database';
import {userService} from '../services/userService';
import UserProfileHeader from '../components/UserProfileHeader';
import PersonalInfoSection from '../components/PersonalInfoSection';
import InvestorProfileSection from '../components/InvestorProfileSection';
import ChangePasswordModal from '../components/ChangePasswordModal';
import Button from '../../../shared/components/Button';
import {Ionicons} from '@expo/vector-icons';

const ScreenContainer = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background};
`;

const Header = styled.View`
  height: 120px;
  background-color: ${({theme}) => theme.colors.primary};
  flex-direction: row;
  align-items: center;
  padding: ${({theme}) => theme.spacing.lg}px;
  padding-top: 50px;
`;

const HeaderContent = styled.View`
  flex-direction: row;
  align-items: center;
  flex: 1;
`;

const BackButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  align-items: center;
  justify-content: center;
  margin-right: ${({theme}) => theme.spacing.md}px;
`;

const Title = styled.Text`
  color: ${({theme}) => theme.colors.textLight};
  font-size: 24px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h2.fontFamily};
`;

const Content = styled(ScrollView)`
  flex: 1;
`;

const DeleteAccountContainer = styled.View`
  padding: ${({theme}) => theme.spacing.lg}px ${({theme}) => theme.spacing.lg}px;
  margin-bottom: ${({theme}) => theme.spacing.xl}px;
  margin-top: ${({theme}) => theme.spacing.md}px;
`;

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {user, signOut} = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [userData, setUserData] = useState(user);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = useCallback(() => {
    if (!user) return;

    try {
      const fullUserData = getUserById(user.id);
      if (fullUserData) {
        setUserData(fullUserData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
    }
  }, [user]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, [loadUserData]);

  const handleUpdate = useCallback(() => {
    loadUserData();
  }, [loadUserData]);

  const handleChangePassword = useCallback(() => {
    setShowPasswordModal(true);
  }, []);

  const handlePasswordSuccess = useCallback(() => {
    setShowPasswordModal(false);
    loadUserData();
  }, [loadUserData]);

  const handleRetakeTest = useCallback(() => {
    if (!user) return;
    navigation.navigate('RiskProfile', {userId: user.id});
  }, [user, navigation]);

  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleDeleteAccount = useCallback(() => {
    if (!user) return;

    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação é permanente e não pode ser desfeita. Todos os seus dados serão perdidos.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAccount(user.id);
              Alert.alert(
                'Conta Excluída',
                'Sua conta foi excluída com sucesso.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      signOut();
                      navigation.reset({
                        index: 0,
                        routes: [{name: 'Login'}],
                      });
                    },
                  },
                ]
              );
            } catch (error) {
              console.error('Erro ao excluir conta:', error);
              Alert.alert('Erro', 'Não foi possível excluir a conta. Tente novamente.');
            }
          },
        },
      ]
    );
  }, [user, signOut, navigation]);

  if (!user || !userData) {
    return (
      <ScreenContainer>
        <Content>
          <View style={{padding: 24, alignItems: 'center', justifyContent: 'center', flex: 1}}>
            <Ionicons name="person-outline" size={48} color="#9CA3AF" />
            <Text style={{marginTop: 16, color: '#6B7280', fontSize: 16}}>
              Carregando dados do usuário...
            </Text>
          </View>
        </Content>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Header>
        <HeaderContent>
          <BackButton onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </BackButton>
          <Title>Configurações</Title>
        </HeaderContent>
      </Header>
      <Content
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#8B5CF6']}
            tintColor="#8B5CF6"
          />
        }
        showsVerticalScrollIndicator={false}>
        <UserProfileHeader name={userData.name} />

        <View style={{paddingHorizontal: 24}}>
          <PersonalInfoSection
            userId={user.id}
            name={userData.name}
            email={userData.email}
            cpf={userData.cpf}
            phone={userData.phone}
            onUpdate={handleUpdate}
            onOpenChangePassword={handleChangePassword}
          />

          <InvestorProfileSection
            riskProfile={userData.riskProfile as RiskProfile | undefined}
            onRetakeTest={handleRetakeTest}
          />
        </View>

        <DeleteAccountContainer>
          <Button
            title="Excluir Conta"
            onPress={handleDeleteAccount}
            variant="ghost"
            color="#EF4444"
            size="medium"
            icon={<Ionicons name="trash-outline" size={18} color="#EF4444" />}
          />
        </DeleteAccountContainer>
      </Content>

      <ChangePasswordModal
        visible={showPasswordModal}
        userId={user.id}
        onClose={() => setShowPasswordModal(false)}
        onSuccess={handlePasswordSuccess}
      />
    </ScreenContainer>
  );
};

export default SettingsScreen;

import React, {useState} from 'react';
import {Modal, Alert} from 'react-native';
import styled from 'styled-components/native';
import {Ionicons} from '@expo/vector-icons';
import Input from '../../../shared/components/Input';
import Button from '../../../shared/components/Button';
import {userService} from '../services/userService';

interface ChangePasswordModalProps {
  visible: boolean;
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

const ModalContainer = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding: ${({theme}) => theme.spacing.lg}px;
`;

const ModalContent = styled.View`
  background-color: ${({theme}) => theme.colors.surface};
  border-radius: ${({theme}) => theme.borderRadius.lg}px;
  width: 100%;
  max-width: 400px;
  padding: ${({theme}) => theme.spacing.xl}px;
  ${({theme}) => theme.shadows.lg}
`;

const ModalHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

const ModalTitle = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 20px;
  font-weight: 700;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const CloseButton = styled.TouchableOpacity`
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: ${({theme}) => theme.colors.border};
  justify-content: center;
  align-items: center;
`;

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  userId,
  onClose,
  onSuccess,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  const handleSave = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Erro', 'Digite sua senha atual');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Erro', 'Digite a nova senha');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    setIsSaving(true);
    try {
      await userService.updatePassword(userId, newPassword);
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      handleClose();
      onSuccess();
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      Alert.alert('Erro', 'Não foi possível alterar a senha. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}>
      <ModalContainer>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Alterar Senha</ModalTitle>
            <CloseButton onPress={handleClose}>
              <Ionicons name="close" size={20} color="#374151" />
            </CloseButton>
          </ModalHeader>

          <Input
            label="Senha Atual"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            placeholder="Digite sua senha atual"
            secureTextEntry
            showPasswordToggle
            icon="lock-closed-outline"
          />

          <Input
            label="Nova Senha"
            value={newPassword}
            onChangeText={setNewPassword}
            placeholder="Digite a nova senha (mín. 6 caracteres)"
            secureTextEntry
            showPasswordToggle
            icon="lock-closed-outline"
          />

          <Input
            label="Confirmar Nova Senha"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Digite a nova senha novamente"
            secureTextEntry
            showPasswordToggle
            icon="lock-closed-outline"
          />

          <Button
            title={isSaving ? 'Alterando...' : 'Alterar Senha'}
            onPress={handleSave}
            variant="gradient"
            size="large"
            disabled={isSaving}
            style={{marginTop: 8}}
          />
        </ModalContent>
      </ModalContainer>
    </Modal>
  );
};

export default ChangePasswordModal;







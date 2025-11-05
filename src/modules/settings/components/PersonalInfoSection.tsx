import React, {useState} from 'react';
import styled from 'styled-components/native';
import {Alert} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import Input from '../../../shared/components/Input';
import Card from '../../../shared/components/Card';
import Button from '../../../shared/components/Button';
import {userService} from '../services/userService';

interface PersonalInfoSectionProps {
  userId: number;
  name: string;
  email?: string;
  cpf?: string;
  phone?: string;
  onUpdate: () => void;
  onOpenChangePassword: () => void;
}

const Container = styled.View`
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

const SectionCard = styled(Card)`
  padding: ${({theme}) => theme.spacing.lg}px;
  ${({theme}) => theme.shadows.sm}
`;

const SectionTitle = styled.Text`
  color: ${({theme}) => theme.colors.textDark};
  font-size: 20px;
  font-weight: 700;
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  userId,
  name: initialName,
  email,
  cpf: initialCpf,
  phone: initialPhone,
  onUpdate,
  onOpenChangePassword,
}) => {
  const [name, setName] = useState(initialName);
  const [cpf, setCpf] = useState(initialCpf || '');
  const [phone, setPhone] = useState(initialPhone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Erro', 'O nome é obrigatório');
      return;
    }

    setIsSaving(true);
    try {
      await userService.updateUser(userId, {
        name: name.trim(),
        cpf: cpf.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      Alert.alert('Sucesso', 'Dados atualizados com sucesso!');
      onUpdate();
    } catch (error) {
      console.error('Erro ao atualizar dados:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados. Tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = 
    name !== initialName ||
    cpf !== (initialCpf || '') ||
    phone !== (initialPhone || '');

  return (
    <Container>
      <SectionCard variant="elevated">
        <SectionTitle>Informações Pessoais</SectionTitle>

        <Input
          label="Nome Completo"
          value={name}
          onChangeText={setName}
          placeholder="Digite seu nome completo"
          icon="person-outline"
        />

        <Input
          label="E-mail"
          value={email || ''}
          editable={false}
          placeholder="E-mail não editável"
          icon="mail-outline"
        />

        <Input
          label="CPF (Opcional)"
          value={cpf}
          onChangeText={setCpf}
          placeholder="000.000.000-00"
          keyboardType="numeric"
          icon="card-outline"
        />

        <Input
          label="Telefone (Opcional)"
          value={phone}
          onChangeText={setPhone}
          placeholder="(00) 00000-0000"
          keyboardType="phone-pad"
          icon="call-outline"
        />

        <Button
          title="Alterar Senha"
          onPress={onOpenChangePassword}
          variant="secondary"
          size="medium"
          icon={<Ionicons name="lock-closed-outline" size={18} color="#8B5CF6" />}
          style={{marginTop: 8}}
        />

        {hasChanges && (
          <Button
            title={isSaving ? 'Salvando...' : 'Salvar Alterações'}
            onPress={handleSave}
            variant="gradient"
            size="medium"
            disabled={isSaving}
            style={{marginTop: 16}}
          />
        )}
      </SectionCard>
    </Container>
  );
};

export default PersonalInfoSection;


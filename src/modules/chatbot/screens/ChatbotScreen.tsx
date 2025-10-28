import React, {useState, useRef, useEffect} from 'react';
import {FlatList, KeyboardAvoidingView, Platform, Text} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {RootStackNavigationProp} from '../../../core/navigation/types';
import {ChatMessage} from '../../../shared/types';
import {chatbotService} from '../services/chatbotService';
import {useAuth} from '../../../shared/hooks/useAuth';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import Container from '../../../shared/components/Container';
import GradientHeader from '../../../shared/components/GradientHeader';
import Card from '../../../shared/components/Card';
import IconButton from '../../../shared/components/IconButton';

const ScreenContainer = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background};
  padding: ${({theme}) => theme.spacing.md}px;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
`;

const Title = styled.Text`
  flex: 1;
  color: ${({theme}) => theme.colors.textLight};
  font-size: 20px;
  font-weight: 600;
  text-align: center;
`;

const MessagesContainer = styled.View`
  flex: 1;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const MessageBubble = styled.View<{isUser: boolean}>`
  padding: 12px 16px;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  max-width: 80%;
  background-color: ${({theme, isUser}) => isUser ? theme.colors.primary : theme.colors.card};
  align-self: ${({isUser}) => (isUser ? 'flex-end' : 'flex-start')};
`;

const MessageText = styled.Text<{isUser: boolean}>`
  color: ${({theme, isUser}) =>
    isUser ? theme.colors.textLight : theme.colors.text};
  font-size: 16px;
  line-height: 22px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: ${({theme}) => theme.spacing.sm}px;
  padding: ${({theme}) => theme.spacing.sm}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  margin-top: ${({theme}) => theme.spacing.sm}px;
`;

const ChatInputWrapper = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.card};
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  padding: ${({theme}) => theme.spacing.xs}px;
`;

const ChatInput = styled.TextInput`
  flex: 1;
  padding: ${({theme}) => theme.spacing.sm}px;
  font-size: 16px;
  color: ${({theme}) => theme.colors.text};
  font-family: ${({theme}) => theme.typography.body.fontFamily};
  max-height: 100px;
  placeholderTextColor: ${({theme}) => theme.colors.textSecondary};
`;

const SendButtonWrapper = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  background-color: ${({theme}) => theme.colors.accent};
  align-items: center;
  justify-content: center;
`;

const TypingIndicator = styled.View`
  flex-direction: row;
  padding: 12px 16px;
  background-color: ${({theme}) => theme.colors.card};
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  align-self: flex-start;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
`;

const Dot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({theme}) => theme.colors.textSecondary};
  margin-right: 4px;
`;

const AvatarContainer = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${({theme}) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  margin-right: ${({theme}) => theme.spacing.sm}px;
`;

const MessageRow = styled.View<{isUser: boolean}>`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: ${({theme}) => theme.spacing.xs}px;
  max-width: 100%;
`;

const ChatbotScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {user} = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Olá! Sou seu assistente virtual de investimentos. Como posso ajudá-lo hoje?',
      isUser: false,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Scroll para a última mensagem quando novas mensagens são adicionadas
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({animated: true});
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || !user) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
      userId: user.id,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await chatbotService.sendMessage(user.id, inputText.trim());
      setMessages(prev => [...prev, botResponse]);
    } catch {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        text: 'Desculpe, ocorreu um erro. Tente novamente.',
        isUser: false,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderMessage = ({item, index}: {item: ChatMessage; index: number}) => {
    const showAvatar = !item.isUser && (index === 0 || messages[index - 1].isUser);
    
    return (
      <MessageRow isUser={item.isUser}>
        {showAvatar && (
          <AvatarContainer>
            <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
          </AvatarContainer>
        )}
        {!showAvatar && !item.isUser && <AvatarContainer style={{width: 0, height: 0}} />}
        <MessageBubble isUser={item.isUser} variant="elevated">
          <MessageText isUser={item.isUser}>{item.text}</MessageText>
        </MessageBubble>
      </MessageRow>
    );
  };

  const renderTypingIndicator = () => (
    <MessageRow isUser={false}>
      <AvatarContainer>
        <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
      </AvatarContainer>
      <TypingIndicator>
        <Dot />
        <Dot />
        <Dot />
      </TypingIndicator>
    </MessageRow>
  );

  return (
    <Container>
      <GradientHeader height={80}>
        <Text style={{color: 'white', fontSize: 20, fontWeight: '600'}}>
          Assistente Virtual
        </Text>
      </GradientHeader>
      
      <ScreenContainer>
          <HeaderContainer>
            <Title>Chat</Title>
            <IconButton
              iconName="arrow-back-outline"
              iconLibrary="Ionicons"
              onPress={handleBack}
              variant="translucent"
              size="medium"
              color="#EF44F2"
            />
          </HeaderContainer>

        <MessagesContainer>
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={({item, index}) => renderMessage({item, index})}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            ListFooterComponent={isLoading ? renderTypingIndicator : null}
          />
        </MessagesContainer>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <InputContainer>
              <ChatInputWrapper>
                <ChatInput
                  placeholder="Digite sua mensagem..."
                  value={inputText}
                  onChangeText={setInputText}
                  onSubmitEditing={handleSendMessage}
                  multiline
                  blurOnSubmit={false}
                  returnKeyType="send"
                />
              </ChatInputWrapper>
              <SendButtonWrapper
                onPress={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                style={{opacity: isLoading || !inputText.trim() ? 0.5 : 1}}
              >
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </SendButtonWrapper>
            </InputContainer>
        </KeyboardAvoidingView>
      </ScreenContainer>
    </Container>
  );
};

export default ChatbotScreen;

import React, {useState, useRef, useEffect} from 'react';
import {FlatList, KeyboardAvoidingView, Platform, Text} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {RootStackNavigationProp} from '../../../core/navigation/types';
import {ChatMessage} from '../../../shared/types';
import {chatbotService} from '../services/chatbotService';
import Button from '../../../shared/components/Button';
import Input from '../../../shared/components/Input';
import Container from '../../../shared/components/Container';
import GradientHeader from '../../../shared/components/GradientHeader';
import Card from '../../../shared/components/Card';
import IconButton from '../../../shared/components/IconButton';

const ScreenContainer = styled.View`
  flex: 1;
`;

const HeaderContainer = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({theme}) => theme.spacing.lg}px;
`;

const Title = styled.Text`
  color: ${({theme}) => theme.colors.text};
  font-size: 20px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const MessagesContainer = styled.View`
  flex: 1;
  margin-bottom: ${({theme}) => theme.spacing.md}px;
`;

const MessageBubble = styled(Card)<{isUser: boolean}>`
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  align-self: ${({isUser}) => (isUser ? 'flex-end' : 'flex-start')};
  max-width: 80%;
  background-color: ${({theme, isUser}) =>
    isUser ? theme.colors.primary : theme.colors.card};
`;

const MessageText = styled.Text<{isUser: boolean}>`
  color: ${({theme, isUser}) =>
    isUser ? theme.colors.background : theme.colors.text};
  font-size: 16px;
  line-height: 22px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const InputContainer = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: ${({theme}) => theme.spacing.sm}px;
`;

const ChatInput = styled(Input)`
  flex: 1;
  margin-bottom: 0;
`;

const SendButton = styled(IconButton)`
  margin-bottom: 0;
`;

const ChatbotScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
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
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      const botResponse = await chatbotService.sendMessage(inputText.trim());
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

  const renderMessage = ({item}: {item: ChatMessage}) => (
    <MessageBubble isUser={item.isUser} variant="elevated">
      <MessageText isUser={item.isUser}>{item.text}</MessageText>
    </MessageBubble>
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
            renderItem={renderMessage}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
          />
        </MessagesContainer>

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <InputContainer>
              <ChatInput
                placeholder="Digite sua mensagem..."
                value={inputText}
                onChangeText={setInputText}
                multiline
                style={{maxHeight: 100}}
              />
              <SendButton
                iconName="send"
                iconLibrary="Ionicons"
                onPress={handleSendMessage}
                disabled={isLoading || !inputText.trim()}
                variant="translucent"
                size="medium"
                color="#72F2F2"
              />
            </InputContainer>
        </KeyboardAvoidingView>
      </ScreenContainer>
    </Container>
  );
};

export default ChatbotScreen;

import React, {useState, useRef, useEffect} from 'react';
import {FlatList, KeyboardAvoidingView, Platform, Text, View, TouchableOpacity, TextInput} from 'react-native';
import styled from 'styled-components/native';
import {useNavigation} from '@react-navigation/native';
import {Ionicons} from '@expo/vector-icons';
import {RootStackNavigationProp} from '../../../core/navigation/types';
import {ChatMessage} from '../../../shared/types';
import {chatbotService} from '../services/chatbotService';
import {useAuth} from '../../../shared/hooks/useAuth';

// Header
const HeaderContainer = styled.View`
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

const HeaderTitle = styled.Text`
  color: ${({theme}) => theme.colors.textLight};
  font-size: 20px;
  font-weight: 600;
  font-family: ${({theme}) => theme.typography.h3.fontFamily};
`;

const HeaderSubtitle = styled.Text`
  color: ${({theme}) => theme.colors.textMuted};
  font-size: 14px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
  margin-top: 2px;
`;


// Container principal
const MainContainer = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.background};
`;

const MessagesContainer = styled.View`
  flex: 1;
  padding: ${({theme}) => theme.spacing.md}px;
`;

const MessageRow = styled.View<{isUser: boolean}>`
  flex-direction: row;
  align-items: flex-start;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  max-width: 100%;
`;

const BotAvatar = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${({theme}) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  margin-right: ${({theme}) => theme.spacing.sm}px;
`;

const MessageBubble = styled.View<{isUser: boolean}>`
  padding: 12px 16px;
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  max-width: 80%;
  background-color: ${({theme, isUser}) => 
    isUser ? theme.colors.primary : theme.colors.card};
  align-self: ${({isUser}) => (isUser ? 'flex-end' : 'flex-start')};
  ${({theme}) => theme.shadows.sm}
`;

const MessageText = styled.Text<{isUser: boolean}>`
  color: ${({theme, isUser}) =>
    isUser ? theme.colors.textLight : theme.colors.text};
  font-size: 16px;
  line-height: 22px;
  font-family: ${({theme}) => theme.typography.body.fontFamily};
`;

const TypingIndicator = styled.View`
  flex-direction: row;
  padding: 12px 16px;
  background-color: ${({theme}) => theme.colors.card};
  border-radius: ${({theme}) => theme.borderRadius.md}px;
  align-self: flex-start;
  margin-bottom: ${({theme}) => theme.spacing.sm}px;
  ${({theme}) => theme.shadows.sm}
`;

const Dot = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${({theme}) => theme.colors.textSecondary};
  margin-right: 4px;
`;

// Input area
const InputContainer = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${({theme}) => theme.spacing.md}px;
  background-color: ${({theme}) => theme.colors.surface};
  border-top-width: 1px;
  border-top-color: ${({theme}) => theme.colors.border};
`;

const InputWrapper = styled.View`
  flex: 1;
  background-color: ${({theme}) => theme.colors.card};
  border-radius: ${({theme}) => theme.borderRadius.lg}px;
  padding: ${({theme}) => theme.spacing.sm}px;
  margin-right: ${({theme}) => theme.spacing.sm}px;
  border-width: 1px;
  border-color: ${({theme}) => theme.colors.border};
`;

const ChatInput = styled.TextInput`
  padding: ${({theme}) => theme.spacing.sm}px;
  font-size: 16px;
  color: ${({theme}) => theme.colors.text};
  font-family: ${({theme}) => theme.typography.body.fontFamily};
  max-height: 100px;
  placeholderTextColor: ${({theme}) => theme.colors.textSecondary};
`;

const SendButton = styled.TouchableOpacity`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({theme}) => theme.colors.primary};
  align-items: center;
  justify-content: center;
  ${({theme}) => theme.shadows.md}
`;


const ChatbotScreen: React.FC = () => {
  const navigation = useNavigation<RootStackNavigationProp>();
  const {user} = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: 'Olá! Sou seu assistente virtual. Este modo usa Pergunta-e-Resposta (QA): envie sua pergunta e um contexto que contenha a resposta.',
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
          <BotAvatar>
            <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
          </BotAvatar>
        )}
        {!showAvatar && !item.isUser && <BotAvatar style={{width: 0, height: 0}} />}
        <MessageBubble isUser={item.isUser}>
          <MessageText isUser={item.isUser}>{item.text}</MessageText>
        </MessageBubble>
      </MessageRow>
    );
  };

  const renderTypingIndicator = () => (
    <MessageRow isUser={false}>
      <BotAvatar>
        <Ionicons name="chatbubbles-outline" size={18} color="#FFFFFF" />
      </BotAvatar>
      <TypingIndicator>
        <Dot />
        <Dot />
        <Dot />
      </TypingIndicator>
    </MessageRow>
  );

  return (
    <MainContainer>
      <HeaderContainer>
        <HeaderContent>
          <BackButton onPress={handleBack}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </BackButton>
          <View style={{flex: 1}}>
            <HeaderTitle>Assistente Virtual</HeaderTitle>
            <HeaderSubtitle>Pergunta e Resposta com Inteligência Artificial</HeaderSubtitle>
          </View>
        </HeaderContent>
      </HeaderContainer>
      
      <View style={{flex: 1}}>
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
            <InputWrapper>
              <ChatInput
                placeholder="Digite sua pergunta (QA)"
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={handleSendMessage}
                multiline
                blurOnSubmit={false}
                returnKeyType="send"
              />
            </InputWrapper>
            <SendButton
              onPress={handleSendMessage}
              disabled={isLoading || !inputText.trim()}
              style={{opacity: isLoading || !inputText.trim() ? 0.5 : 1}}
            >
              <Ionicons name="send" size={20} color="#FFFFFF" />
            </SendButton>
          </InputContainer>
        </KeyboardAvoidingView>
      </View>
    </MainContainer>
  );
};

export default ChatbotScreen;
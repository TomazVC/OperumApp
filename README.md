Readme inicial:

# Operum - Assessor Virtual de Investimentos

App React Native com TypeScript para assessoria de investimentos.

## 🚀 Tecnologias

- React Native 0.82.0
- TypeScript
- React Navigation v6
- Styled Components
- SQLite (react-native-sqlite-storage)
- Axios

## 📱 Funcionalidades

- ✅ Navegação entre telas
- ✅ Autenticação mock
- ✅ Banco de dados SQLite local
- ✅ Portfólio de investimentos
- ✅ Chatbot com IA mock
- ✅ Tema personalizado
- ✅ Componentes reutilizáveis

## 🛠️ Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Para iOS:
   ```bash
   cd ios && pod install && cd ..
   npm run ios
   ```

4. Para Android:
   ```bash
   npm run android
   ```

5. Para Web (navegador):
   ```bash
   npm run web
   ```

6. Para iOS (macOS apenas):
   ```bash
   npm run ios
   ```

## 📦 Dependências Principais

```bash
npm i @react-navigation/native @react-navigation/native-stack react-native-screens react-native-safe-area-context
npm i styled-components axios expo-sqlite
npm i -D @types/styled-components-react-native babel-plugin-module-resolver
```

## 🔧 Configuração SQLite

O `expo-sqlite` funciona nativamente em todas as plataformas sem configuração adicional:

- **Android**: Funciona automaticamente
- **iOS**: Funciona automaticamente  
- **Web**: Funciona nativamente no navegador
- **Configuração**: Nenhuma configuração adicional necessária

## 📁 Estrutura do Projeto

```
src/
├── App.tsx
├── core/
│   ├── api/
│   ├── ai/
│   ├── database/
│   └── navigation/
├── modules/
│   ├── authentication/
│   ├── portfolio/
│   └── chatbot/
└── shared/
    ├── components/
    ├── hooks/
    ├── theme/
    ├── types/
    └── utils/
```

## 🎨 Tema

O app utiliza um tema personalizado com cores e espaçamentos consistentes:
- Background: #0F1220
- Primary: #3b4d9b
- Secondary: #c7559b
- Surface: #1C1F2E

## 📱 Telas

1. **Onboarding**: Introdução ao app
2. **Login**: Autenticação com CPF/email
3. **Portfolio**: Visualização do portfólio
4. **Chatbot**: Assistente virtual

## 🔄 Scripts

- `npm start`: Inicia o Expo development server
- `npm run android`: Executa no Android
- `npm run ios`: Executa no iOS
- `npm run web`: Executa no navegador (desenvolvimento)
- `npm run build:android`: Gera build de produção para Android
- `npm run build:ios`: Gera build de produção para iOS
- `npm run lint`: Executa o ESLint

## 🌐 Suporte Web

O app funciona nativamente no navegador usando Expo:

- **Desenvolvimento**: `npm run web` (abre automaticamente no navegador)
- **SQLite Web**: Funciona nativamente na web sem mocks
- **Simulação Mobile**: Interface otimizada para visualização mobile no desktop
- **Responsivo**: Adapta-se automaticamente ao tamanho da tela
- **Hot Reload**: Atualizações em tempo real durante desenvolvimento

## 📝 Notas

- O app utiliza mock data para demonstração
- SQLite funciona nativamente em todas as plataformas (mobile e web)
- Todos os componentes são tipados com TypeScript
- Interface responsiva e moderna
- Desenvolvido com Expo para máxima compatibilidade
- Hot reload e desenvolvimento mais rápido

## 🏗️ Arquitetura

O projeto segue a arquitetura **Feature-Sliced Design**:

- **Core**: Funcionalidades centrais (navegação, banco, API, IA)
- **Modules**: Funcionalidades específicas (auth, portfolio, chatbot)
- **Shared**: Componentes, hooks, utils e tipos compartilhados

## 🔐 Autenticação

- Sistema mock com validação de CPF/email
- Persistência de usuários no SQLite
- Context API para gerenciamento de estado

## 💼 Portfólio

- Visualização de investimentos
- Criação automática de portfólio padrão
- Cálculo de valor total
- Integração com banco SQLite

## 🤖 Chatbot

- Interface de chat moderna
- Respostas mock com delay simulado
- Auto-scroll para última mensagem
- Integração com serviços de IA

## 🎯 Próximos Passos

- [ ] Integração com APIs reais (BACEN, IBGE, B3)
- [ ] Implementação de IA real
- [ ] Gráficos de performance
- [ ] Notificações push
- [ ] Modo offline
- [ ] Testes automatizados
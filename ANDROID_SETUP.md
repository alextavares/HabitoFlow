# Configuração Android - HabitoFlow

## Passos para Executar

### 1. React Native CLI instalado ✅
```bash
npm install -g @react-native-community/cli
```

### 2. Scripts atualizados ✅
- Agora usam `npx react-native` para garantir funcionamento

### 3. Executar o app

**Terminal 1 - Metro Bundler:**
```bash
npm start
```

**Terminal 2 - Build Android:**
```bash
npm run android
```

## Possíveis Problemas e Soluções

### Se der erro de linking nativo:

1. **react-native-linear-gradient** pode precisar de linking manual:
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

2. **Se ainda houver problemas:**
```bash
# Limpar tudo
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
npx react-native run-android
```

### Verificar emulador Android:
- Certifique-se que o Android Studio está aberto
- Um emulador Android está rodando
- Ou um dispositivo físico está conectado

### Comandos de debug:
```bash
# Verificar dispositivos conectados
adb devices

# Se o metro bundler der problema
npx react-native start --reset-cache
```

## Status Atual
✅ Firebase configurado
✅ Pacotes instalados
✅ Scripts corrigidos
✅ Pronto para rodar!

Execute `npm start` e depois `npm run android` 🚀
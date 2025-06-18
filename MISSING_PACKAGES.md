# Pacotes Pendentes de Instalação

Os seguintes pacotes precisam ser instalados para o app funcionar completamente:

## 1. react-native-linear-gradient
```bash
npm install react-native-linear-gradient
```

## 2. @react-native-async-storage/async-storage
```bash
npm install @react-native-async-storage/async-storage
```

## 3. react-native-canvas (para confetti)
```bash
npm install react-native-canvas
```

## Pacotes já instalados ✅
- @react-native-firebase/app
- @react-native-firebase/auth
- @react-native-firebase/firestore

## Configuração Android adicional

Após instalar os pacotes, você precisa fazer o link nativo:

```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## Nota sobre o erro de instalação
Se você encontrar erros como "ENOTEMPTY", tente:
1. Limpar o cache do npm: `npm cache clean --force`
2. Deletar node_modules e reinstalar: `rm -rf node_modules && npm install`
3. Ou instalar manualmente adicionando ao package.json
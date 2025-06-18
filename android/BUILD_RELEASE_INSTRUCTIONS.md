# Instruções para Build de Release

## Pré-requisitos

1. Certifique-se de ter gerado o keystore seguindo as instruções em `KEYSTORE_INSTRUCTIONS.md`
2. Crie o arquivo `keystore.properties` na pasta `android/`
3. Certifique-se de que o Java 17 está instalado e configurado

## Build do APK

### 1. Limpar builds anteriores
```bash
cd android
./gradlew clean
```

### 2. Gerar o bundle do JavaScript
```bash
cd ..
npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res
```

### 3. Gerar o APK de Release
```bash
cd android
./gradlew assembleRelease
```

O APK será gerado em: `android/app/build/outputs/apk/release/app-release.apk`

## Build do AAB (Android App Bundle)

Para publicar na Google Play Store, é recomendado usar AAB:

```bash
cd android
./gradlew bundleRelease
```

O AAB será gerado em: `android/app/build/outputs/bundle/release/app-release.aab`

## Verificar o APK

Para verificar o tamanho e conteúdo do APK:

```bash
# Ver tamanho por tipo de arquivo
unzip -l app-release.apk | grep -E "\.dex|\.so|resources\.arsc" | awk '{sum+=$1} END {print "Total: " sum/1024/1024 " MB"}'

# Analisar com Android Studio
# Tools > Analyze APK
```

## Otimizações Aplicadas

1. **ProGuard**: Habilitado para ofuscar e reduzir o código
2. **shrinkResources**: Remove recursos não utilizados
3. **Java 17**: Versão mais recente para melhor performance
4. **Hermes**: Engine JavaScript otimizada (já habilitada)

## Troubleshooting

### Erro de memória durante o build
Adicione ao `gradle.properties`:
```
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=1024m
```

### Erro de assinatura
Verifique se o arquivo `keystore.properties` está correto e o keystore existe

### APK muito grande
- Verifique se ProGuard está habilitado
- Use `splits` para gerar APKs por arquitetura
- Considere usar Dynamic Delivery com App Bundles
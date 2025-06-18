# Instruções para Gerar Keystore de Produção

## Passo 1: Gerar o Keystore

Execute o seguinte comando no terminal do Windows (CMD ou PowerShell) na pasta `android/app`:

```bash
keytool -genkey -v -keystore habitoflow-release.keystore -alias habitoflow -keyalg RSA -keysize 2048 -validity 10000
```

Você será solicitado a fornecer as seguintes informações:
- Senha do keystore (anote em local seguro)
- Senha do alias (pode ser a mesma)
- Nome completo: HabitoFlow
- Unidade organizacional: Mobile
- Organização: HabitoFlow
- Cidade: Sua cidade
- Estado: Seu estado
- Código do país: BR

## Passo 2: Configurar o Gradle

Após gerar o keystore, crie um arquivo `keystore.properties` na pasta `android/` com o seguinte conteúdo:

```properties
storePassword=SUA_SENHA_DO_KEYSTORE
keyPassword=SUA_SENHA_DO_ALIAS
keyAlias=habitoflow
storeFile=habitoflow-release.keystore
```

## IMPORTANTE: Segurança

1. **NUNCA** commite o arquivo keystore ou keystore.properties no repositório
2. Adicione ao `.gitignore`:
   - `*.keystore`
   - `keystore.properties`
3. Faça backup do keystore em local seguro - se perder, não poderá atualizar o app na Play Store
4. Guarde as senhas em um gerenciador de senhas seguro
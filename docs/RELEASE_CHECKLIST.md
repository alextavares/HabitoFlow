# Checklist de Publicação - HabitoFlow

## 📋 Pré-lançamento

### Desenvolvimento
- [x] Funcionalidades principais implementadas
- [x] Sistema de autenticação (Firebase + Google)
- [x] Navegação entre telas
- [x] Notificações locais
- [x] Sistema de gamificação
- [x] Tema claro/escuro
- [x] Splash screen

### Testes
- [ ] Teste em dispositivos físicos (mínimo 3 diferentes)
- [ ] Teste em diferentes versões do Android (6.0+)
- [ ] Teste de performance (sem travamentos)
- [ ] Teste offline (comportamento sem internet)
- [ ] Teste de memória (sem vazamentos)
- [ ] Teste de bateria (consumo aceitável)

### Build de Produção
- [x] Keystore gerado e armazenado com segurança
- [x] ProGuard configurado e testado
- [x] Versioning configurado (versionCode e versionName)
- [ ] APK/AAB assinado gerado
- [ ] APK testado após assinatura

## 🎨 Assets da Play Store

### Gráficos
- [x] Ícone do app (512x512 PNG)
- [x] Ícone adaptativo implementado
- [ ] Screenshots capturados (mínimo 2)
- [ ] Banner de recursos criado (1024x500)
- [ ] Screenshots otimizados (sem dados pessoais)

### Textos
- [x] Título do app (30 caracteres)
- [x] Descrição curta (80 caracteres)
- [x] Descrição completa (4000 caracteres)
- [x] Palavras-chave definidas
- [ ] Traduções (se aplicável)

### Listagem
- [x] Categoria selecionada (Produtividade)
- [x] Classificação de conteúdo (Livre)
- [ ] Política de privacidade hospedada
- [ ] E-mail de suporte configurado
- [ ] Website (opcional)

## 🔒 Conformidade e Segurança

### Privacidade
- [ ] Política de privacidade escrita
- [ ] URL da política acessível
- [ ] Conformidade com LGPD/GDPR
- [ ] Declaração de uso de dados

### Permissões
- [x] Permissões mínimas necessárias
- [x] Justificativas claras para cada permissão
- [ ] Teste sem permissões opcionais

### Segurança
- [x] Dados sensíveis criptografados
- [x] Comunicação HTTPS apenas
- [x] Sem secrets hardcoded
- [ ] Teste de segurança básico

## 📱 Configuração da Play Console

### Conta de Desenvolvedor
- [ ] Conta criada ($25 taxa única)
- [ ] Perfil verificado
- [ ] Informações de pagamento

### Criação do App
- [ ] Novo app criado na console
- [ ] Idioma padrão selecionado
- [ ] Tipo de app (Aplicativo)

### Versão de Produção
- [ ] Upload do AAB/APK
- [ ] Notas de lançamento escritas
- [ ] Países/regiões selecionados
- [ ] Rollout configurado (100% ou gradual)

## 🚀 Lançamento

### Revisão Final
- [ ] Todos os campos obrigatórios preenchidos
- [ ] Preview da listagem verificado
- [ ] Teste interno realizado
- [ ] Feedback inicial coletado

### Publicação
- [ ] Enviar para revisão
- [ ] Aguardar aprovação (2-24 horas)
- [ ] Monitorar status
- [ ] Preparar respostas para possíveis rejeições

## 📊 Pós-lançamento

### Monitoramento
- [ ] Verificar crashes no Play Console
- [ ] Monitorar avaliações
- [ ] Responder reviews
- [ ] Acompanhar métricas de instalação

### Marketing
- [ ] Anúncio em redes sociais
- [ ] E-mail para beta testers
- [ ] ASO (otimização da loja)
- [ ] Solicitar reviews dos primeiros usuários

### Manutenção
- [ ] Plano de atualizações
- [ ] Backlog de melhorias
- [ ] Correção de bugs reportados
- [ ] Novas features baseadas em feedback

## 🛠️ Comandos Úteis

### Gerar APK de Release
```bash
cd android
./gradlew assembleRelease
# APK em: android/app/build/outputs/apk/release/
```

### Gerar AAB (recomendado)
```bash
cd android
./gradlew bundleRelease
# AAB em: android/app/build/outputs/bundle/release/
```

### Testar APK assinado
```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

### Gerar Screenshots
```bash
# No emulador ou dispositivo
adb shell screencap -p /sdcard/screenshot.png
adb pull /sdcard/screenshot.png
```

## 📝 Notas Importantes

1. **Backup do Keystore**: CRÍTICO! Sem ele, você não poderá atualizar o app
2. **Versioning**: Sempre incremente versionCode para updates
3. **Testes**: Teste TUDO novamente após gerar o build de produção
4. **Paciência**: A primeira publicação pode levar mais tempo para aprovação
5. **Rejeições**: São normais, leia com atenção e corrija

## 🎯 Critérios de Sucesso

- [ ] App publicado e disponível na Play Store
- [ ] Primeiras 10 instalações sem crashes
- [ ] Avaliação média acima de 4.0
- [ ] Feedback positivo dos usuários
- [ ] Plano de melhorias definido

---

**Última atualização**: Configure a data quando começar o processo de publicação

**Responsável**: [Seu nome]

**Status**: Em preparação
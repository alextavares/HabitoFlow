# 🎨 HabitoFlow - Sistema de Design

## 📱 Inspirações e Tendências 2025

### **Apps de Referência**
- **Habitify**: Interface limpa, cards arredondados, gamificação sutil
- **Streaks**: Minimalista, foco em números grandes e visuais
- **Way of Life**: Código de cores intuitivo (verde/vermelho)

### **Tendências de Design 2025**
1. **Glassmorphism** - Transparências e blur para profundidade
2. **Neumorphismo Suave** - Sombras sutis para elementos tácteis
3. **Micro-animações** - Feedback visual instantâneo
4. **Dark Mode** - Essencial para saúde visual
5. **Tipografia Bold** - Números grandes para métricas

## 🎨 Paleta de Cores

### **Cores Principais**
```css
/* Tema Claro */
--primary: #6366F1;        /* Indigo vibrante */
--primary-light: #818CF8;  /* Indigo claro */
--primary-dark: #4F46E5;   /* Indigo escuro */

--success: #10B981;        /* Verde sucesso */
--warning: #F59E0B;        /* Amarelo alerta */
--danger: #EF4444;         /* Vermelho perigo */

--background: #F9FAFB;     /* Cinza muito claro */
--surface: #FFFFFF;        /* Branco puro */
--text-primary: #111827;   /* Preto suave */
--text-secondary: #6B7280; /* Cinza médio */

/* Tema Escuro */
--dark-background: #0F172A;
--dark-surface: #1E293B;
--dark-text: #F3F4F6;
```

### **Gradientes Modernos**
```css
/* Gradiente Principal */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Gradiente Sucesso */
background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);

/* Gradiente Premium */
background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
```

## 🪟 Componentes com Glassmorphism

### **Card de Hábito**
```javascript
const habitCardStyle = {
  background: 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: 20,
  border: '1px solid rgba(255, 255, 255, 0.3)',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.1,
  shadowRadius: 20,
  elevation: 5,
};
```

### **Botão Flutuante (FAB)**
```javascript
const fabStyle = {
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  width: 60,
  height: 60,
  borderRadius: 30,
  shadowColor: '#667eea',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.4,
  shadowRadius: 20,
  elevation: 8,
};
```

## 📐 Layout e Espaçamento

### **Sistema de Grid**
- Padding horizontal: 20px
- Espaçamento entre cards: 12px
- Border radius padrão: 16px
- Border radius botões: 12px

### **Tipografia**
```javascript
const typography = {
  // Títulos
  h1: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
  h3: { fontSize: 20, fontWeight: '600' },
  
  // Corpo
  body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  caption: { fontSize: 14, fontWeight: '400', opacity: 0.7 },
  
  // Números grandes (streaks, stats)
  display: { fontSize: 48, fontWeight: '900', letterSpacing: -1 },
};
```

## 🎯 Prompts para IA Gerar Designs

### **Prompt Base para Telas**
```
"Design a modern mobile app screen for a habit tracker app called HabitoFlow. 
Use glassmorphism effects, rounded corners, and a color palette of indigo (#6366F1) 
as primary color with green (#10B981) for success states. Include subtle shadows, 
clean typography, and micro-interactions. The design should feel premium but friendly, 
with plenty of white space and modern iOS/Android design patterns."
```

### **Prompt para Componentes**
```
"Create a habit card component with:
- Glassmorphic background (white with 70% opacity and 10px blur)
- Rounded corners (20px radius)
- Left border with habit-specific color
- Emoji icon on the left
- Habit name and streak count
- Circular checkbox on the right that fills with color when checked
- Subtle shadow for depth
- Smooth press animation"
```

### **Prompt para Ícones e Ilustrações**
```
"Design a set of achievement badges for a habit tracking app:
- Minimalist style with gradient fills
- Use indigo to purple gradients
- Include badges for: 7-day streak, 30-day streak, 100 days total
- Geometric shapes with subtle shadows
- Modern, clean aesthetic
- SVG-friendly design"
```

## 🎮 Micro-interações

### **Checkbox Animation**
```javascript
// Ao marcar como completo
Animated.parallel([
  Animated.timing(scale, {
    toValue: 1.2,
    duration: 200,
    useNativeDriver: true,
  }),
  Animated.timing(opacity, {
    toValue: 1,
    duration: 300,
    useNativeDriver: true,
  }),
]).start(() => {
  Animated.spring(scale, {
    toValue: 1,
    useNativeDriver: true,
  }).start();
});
```

### **Confetti ao Completar Streak**
```javascript
// Usar react-native-confetti-cannon
<ConfettiCannon
  count={50}
  origin={{x: -10, y: 0}}
  colors={['#667eea', '#764ba2', '#10B981']}
  fadeOut={true}
/>
```

## 🌙 Dark Mode

### **Adaptações para Tema Escuro**
- Backgrounds: Tons de cinza escuro (#0F172A)
- Cards: Cinza médio com opacity reduzida
- Glassmorphism: Usar rgba(255,255,255,0.1) 
- Textos: Branco com 90% opacity
- Cores vibrantes: Manter saturação alta

## 📱 Ferramentas Recomendadas

### **Para Protótipos**
1. **Figma** - Com plugins de glassmorphism
2. **Framer** - Para micro-animações
3. **Principle** - Transições complexas

### **Geradores com IA**
1. **Galileo AI** - UI completa via prompt
2. **Uizard** - Texto para interface
3. **Midjourney** - Conceitos visuais
4. **v0.dev** - Componentes React

### **Bibliotecas React Native**
```json
{
  "react-native-linear-gradient": "^2.8.0",
  "react-native-blur": "^4.3.0",
  "react-native-reanimated": "^3.5.0",
  "react-native-gesture-handler": "^2.13.0",
  "react-native-haptic-feedback": "^2.2.0",
  "react-native-confetti-cannon": "^1.5.2",
  "react-native-svg": "^14.0.0",
  "lottie-react-native": "^6.4.0"
}
```

## 🎯 Diretrizes de UX

1. **Feedback Instantâneo**: Toda ação tem resposta visual/háptica
2. **Hierarquia Clara**: Tamanhos e cores guiam o olhar
3. **Gestos Intuitivos**: Swipe para deletar, press longo para editar
4. **Onboarding Minimal**: 3 telas máximo
5. **Celebrações**: Animações para marcos importantes

## 💡 Dicas para Implementação

1. **Performance First**: Animações em 60fps
2. **Acessibilidade**: Contraste mínimo 4.5:1
3. **Responsive**: Adaptar para tablets
4. **Offline First**: Funcionar sem internet
5. **Loading States**: Skeletons ao invés de spinners
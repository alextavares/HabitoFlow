import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

interface Emoji {
  icon: string;
  name: string;
}

interface Color {
  hex: string;
  name: string;
}

const AddHabitScreen = ({ navigation }: any) => {
  const [habitName, setHabitName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#6366F1');
  const [frequency, setFrequency] = useState('daily');
  const [reminderTime, setReminderTime] = useState('09:00');
  const [targetDays, setTargetDays] = useState('30');

  const slideAnim = useRef(new Animated.Value(300)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const emojis: Emoji[] = [
    { icon: '💧', name: 'Água' },
    { icon: '💪', name: 'Exercício' },
    { icon: '🧘', name: 'Meditação' },
    { icon: '📚', name: 'Leitura' },
    { icon: '🏃', name: 'Corrida' },
    { icon: '🥗', name: 'Alimentação' },
    { icon: '💤', name: 'Sono' },
    { icon: '💊', name: 'Remédio' },
    { icon: '🎯', name: 'Foco' },
    { icon: '✍️', name: 'Escrita' },
    { icon: '🎨', name: 'Arte' },
    { icon: '🌱', name: 'Crescimento' },
  ];

  const colors: Color[] = [
    { hex: '#6366F1', name: 'Indigo' },
    { hex: '#8B5CF6', name: 'Roxo' },
    { hex: '#10B981', name: 'Verde' },
    { hex: '#F59E0B', name: 'Amarelo' },
    { hex: '#EF4444', name: 'Vermelho' },
    { hex: '#EC4899', name: 'Rosa' },
    { hex: '#3B82F6', name: 'Azul' },
    { hex: '#14B8A6', name: 'Turquesa' },
  ];

  const frequencyOptions = [
    { value: 'daily', label: 'Todos os dias', icon: '📅' },
    { value: 'weekdays', label: 'Dias úteis', icon: '💼' },
    { value: 'weekends', label: 'Fins de semana', icon: '🏖️' },
    { value: 'custom', label: 'Personalizado', icon: '⚙️' },
  ];

  const handleSave = () => {
    if (!habitName.trim()) {
      Alert.alert('Ops!', 'Dê um nome ao seu hábito 😊');
      return;
    }

    // TODO: Salvar no Firebase
    Alert.alert(
      'Hábito Criado! 🎉',
      `"${habitName}" foi adicionado com sucesso!`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        style={styles.header}
      >
        <SafeAreaView>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Novo Hábito</Text>
            <View style={{ width: 40 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Preview do hábito */}
            <View style={[styles.previewCard, styles.glassmorphism]}>
              <View style={[styles.previewIcon, { backgroundColor: selectedColor + '20' }]}>
                <Text style={styles.previewEmoji}>{selectedEmoji}</Text>
              </View>
              <Text style={styles.previewName}>
                {habitName || 'Seu novo hábito'}
              </Text>
              <Text style={styles.previewFrequency}>
                {frequencyOptions.find(f => f.value === frequency)?.label}
              </Text>
            </View>

            {/* Nome do hábito */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Nome do Hábito</Text>
              <TextInput
                style={styles.input}
                placeholder="Ex: Beber 2L de água"
                placeholderTextColor="#9CA3AF"
                value={habitName}
                onChangeText={setHabitName}
                maxLength={30}
              />
              <Text style={styles.charCount}>{habitName.length}/30</Text>
            </View>

            {/* Seleção de emoji */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Escolha um Ícone</Text>
              <View style={styles.emojiGrid}>
                {emojis.map((emoji) => (
                  <TouchableOpacity
                    key={emoji.icon}
                    style={[
                      styles.emojiButton,
                      selectedEmoji === emoji.icon && styles.emojiSelected,
                    ]}
                    onPress={() => setSelectedEmoji(emoji.icon)}
                  >
                    <Text style={styles.emoji}>{emoji.icon}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Seleção de cor */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cor do Hábito</Text>
              <View style={styles.colorGrid}>
                {colors.map((color) => (
                  <TouchableOpacity
                    key={color.hex}
                    style={[
                      styles.colorButton,
                      { backgroundColor: color.hex },
                      selectedColor === color.hex && styles.colorSelected,
                    ]}
                    onPress={() => setSelectedColor(color.hex)}
                  >
                    {selectedColor === color.hex && (
                      <Text style={styles.checkmark}>✓</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Frequência */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequência</Text>
              <View style={styles.frequencyContainer}>
                {frequencyOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.frequencyButton,
                      frequency === option.value && styles.frequencySelected,
                    ]}
                    onPress={() => setFrequency(option.value)}
                  >
                    <Text style={styles.frequencyIcon}>{option.icon}</Text>
                    <Text style={[
                      styles.frequencyLabel,
                      frequency === option.value && styles.frequencyLabelSelected,
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Meta de dias */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meta de Dias</Text>
              <View style={styles.targetContainer}>
                <TextInput
                  style={styles.targetInput}
                  placeholder="30"
                  placeholderTextColor="#9CA3AF"
                  value={targetDays}
                  onChangeText={setTargetDays}
                  keyboardType="numeric"
                  maxLength={3}
                />
                <Text style={styles.targetLabel}>dias consecutivos</Text>
              </View>
            </View>

            {/* Horário do lembrete */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Lembrete</Text>
              <TouchableOpacity style={styles.reminderButton}>
                <Text style={styles.reminderIcon}>⏰</Text>
                <Text style={styles.reminderTime}>{reminderTime}</Text>
                <Text style={styles.reminderChange}>Alterar</Text>
              </TouchableOpacity>
            </View>

            {/* Botão salvar */}
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[selectedColor, selectedColor + 'CC']}
                start={{x: 0, y: 0}}
                end={{x: 1, y: 0}}
                style={styles.saveGradient}
              >
                <Text style={styles.saveText}>Criar Hábito</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    color: 'white',
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  previewCard: {
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 30,
  },
  glassmorphism: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  previewIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  previewEmoji: {
    fontSize: 40,
  },
  previewName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 5,
  },
  previewFrequency: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 15,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  charCount: {
    textAlign: 'right',
    marginTop: 5,
    fontSize: 12,
    color: '#9CA3AF',
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiButton: {
    width: 60,
    height: 60,
    borderRadius: 15,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emojiSelected: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F1' + '10',
  },
  emoji: {
    fontSize: 28,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: '#E5E7EB',
  },
  checkmark: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  frequencyContainer: {
    gap: 10,
  },
  frequencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  frequencySelected: {
    borderColor: '#6366F1',
    backgroundColor: '#6366F1' + '10',
  },
  frequencyIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  frequencyLabel: {
    fontSize: 16,
    color: '#374151',
  },
  frequencyLabelSelected: {
    color: '#6366F1',
    fontWeight: '600',
  },
  targetContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  targetInput: {
    fontSize: 24,
    fontWeight: '700',
    color: '#6366F1',
    width: 60,
    textAlign: 'center',
  },
  targetLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 10,
  },
  reminderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  reminderIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  reminderTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  reminderChange: {
    color: '#6366F1',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  saveGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
});

export default AddHabitScreen;
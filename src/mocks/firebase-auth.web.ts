// Mock do Firebase Auth para desenvolvimento web
class MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;

  constructor(email: string, uid?: string) {
    this.uid = uid || Math.random().toString(36).substr(2, 9);
    this.email = email;
    this.displayName = email?.split('@')[0] || null;
    this.photoURL = `https://ui-avatars.com/api/?name=${this.displayName}&background=random`;
  }
}

class MockAuth {
  private currentUser: MockUser | null = null;
  private authStateListeners: ((user: any) => void)[] = [];

  constructor() {
    // Verificar se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('mockUser');
    if (savedUser) {
      this.currentUser = JSON.parse(savedUser);
    }
  }

  onAuthStateChanged(callback: (user: any) => void) {
    this.authStateListeners.push(callback);
    // Chamar imediatamente com o estado atual
    callback(this.currentUser);
    
    // Retornar função para remover o listener
    return () => {
      const index = this.authStateListeners.indexOf(callback);
      if (index > -1) {
        this.authStateListeners.splice(index, 1);
      }
    };
  }

  async signInWithEmailAndPassword(email: string, password: string) {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validação básica
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    // Criar usuário mock
    this.currentUser = new MockUser(email);
    localStorage.setItem('mockUser', JSON.stringify(this.currentUser));
    
    // Notificar listeners
    this.authStateListeners.forEach(listener => listener(this.currentUser));
    
    return { user: this.currentUser };
  }

  async createUserWithEmailAndPassword(email: string, password: string) {
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Validação básica
    if (!email || !password) {
      throw new Error('Email e senha são obrigatórios');
    }

    if (password.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }

    // Criar usuário mock
    this.currentUser = new MockUser(email);
    localStorage.setItem('mockUser', JSON.stringify(this.currentUser));
    
    // Notificar listeners
    this.authStateListeners.forEach(listener => listener(this.currentUser));
    
    return { user: this.currentUser };
  }

  async signOut() {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.currentUser = null;
    localStorage.removeItem('mockUser');
    
    // Notificar listeners
    this.authStateListeners.forEach(listener => listener(null));
  }

  async sendPasswordResetEmail(email: string) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log(`[MOCK] Email de redefinição de senha enviado para: ${email}`);
  }

  getCurrentUser() {
    return this.currentUser;
  }
}

// Instância única do mock auth
const authInstance = new MockAuth();

export default () => authInstance;
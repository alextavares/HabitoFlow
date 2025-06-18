// Mock do Google Sign-in para desenvolvimento web
class MockGoogleSignIn {
  private isConfigured = false;

  configure(options?: any) {
    console.log('[MOCK] Google Sign-In configured with options:', options);
    this.isConfigured = true;
  }

  async hasPlayServices(options?: any): Promise<boolean> {
    // Simular que sempre tem Play Services na web
    return true;
  }

  async signIn(): Promise<any> {
    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simular usuário do Google
    const mockUser = {
      user: {
        id: '123456789',
        name: 'Usuário Teste',
        email: 'teste@gmail.com',
        photo: 'https://ui-avatars.com/api/?name=Usuario+Teste&background=4285F4&color=fff',
        familyName: 'Teste',
        givenName: 'Usuário'
      },
      idToken: 'mock-id-token-' + Math.random().toString(36).substr(2, 9),
      serverAuthCode: null,
      scopes: []
    };

    // Salvar no localStorage para persistência
    localStorage.setItem('mockGoogleUser', JSON.stringify(mockUser));

    return mockUser;
  }

  async signInSilently(): Promise<any> {
    // Verificar se tem usuário salvo
    const savedUser = localStorage.getItem('mockGoogleUser');
    if (savedUser) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return JSON.parse(savedUser);
    }
    
    throw new Error('No user found');
  }

  async isSignedIn(): Promise<boolean> {
    return localStorage.getItem('mockGoogleUser') !== null;
  }

  async signOut(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem('mockGoogleUser');
  }

  async revokeAccess(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    localStorage.removeItem('mockGoogleUser');
  }

  async getTokens(): Promise<any> {
    const savedUser = localStorage.getItem('mockGoogleUser');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      return {
        idToken: user.idToken,
        accessToken: 'mock-access-token-' + Math.random().toString(36).substr(2, 9)
      };
    }
    throw new Error('No user signed in');
  }
}

// Exportar instância e classe
export const GoogleSignin = new MockGoogleSignIn();
export default {
  GoogleSignin,
  statusCodes: {
    SIGN_IN_CANCELLED: -1,
    IN_PROGRESS: -2,
    PLAY_SERVICES_NOT_AVAILABLE: -3,
    SIGN_IN_REQUIRED: -4
  }
};
// Mock do Firebase Firestore para desenvolvimento web

export const serverTimestamp = () => ({
  _seconds: Math.floor(Date.now() / 1000),
  _nanoseconds: 0,
  toDate: () => new Date()
});
class MockDocumentSnapshot {
  id: string;
  private _data: any;

  constructor(id: string, data: any) {
    this.id = id;
    this._data = data;
  }

  data() {
    return this._data;
  }

  exists() {
    return this._data !== null;
  }
}

class MockQuerySnapshot {
  docs: MockDocumentSnapshot[];
  size: number;

  constructor(docs: MockDocumentSnapshot[]) {
    this.docs = docs;
    this.size = docs.length;
  }

  forEach(callback: (doc: MockDocumentSnapshot) => void) {
    this.docs.forEach(callback);
  }
}

class MockDocumentReference {
  id: string;
  private collectionPath: string;
  private db: MockFirestore;

  constructor(collectionPath: string, id: string, db: MockFirestore) {
    this.collectionPath = collectionPath;
    this.id = id;
    this.db = db;
  }

  async get() {
    const data = this.db.getDocument(this.collectionPath, this.id);
    return new MockDocumentSnapshot(this.id, data);
  }

  async set(data: any, options?: any) {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.db.setDocument(this.collectionPath, this.id, data);
  }

  async update(data: any) {
    await new Promise(resolve => setTimeout(resolve, 100));
    const existing = this.db.getDocument(this.collectionPath, this.id);
    if (existing) {
      this.db.setDocument(this.collectionPath, this.id, { ...existing, ...data });
    }
  }

  async delete() {
    await new Promise(resolve => setTimeout(resolve, 100));
    this.db.deleteDocument(this.collectionPath, this.id);
  }
}

class MockCollectionReference {
  private path: string;
  private db: MockFirestore;

  constructor(path: string, db: MockFirestore) {
    this.path = path;
    this.db = db;
  }

  doc(id?: string) {
    const docId = id || Math.random().toString(36).substr(2, 9);
    return new MockDocumentReference(this.path, docId, this.db);
  }

  async add(data: any) {
    const id = Math.random().toString(36).substr(2, 9);
    await new Promise(resolve => setTimeout(resolve, 100));
    this.db.setDocument(this.path, id, { ...data, createdAt: new Date() });
    return this.doc(id);
  }

  async get() {
    await new Promise(resolve => setTimeout(resolve, 100));
    const docs = this.db.getCollection(this.path);
    const snapshots = Object.entries(docs).map(([id, data]) => 
      new MockDocumentSnapshot(id, data)
    );
    return new MockQuerySnapshot(snapshots);
  }

  where(field: string, operator: string, value: any) {
    // Retornar uma query mock
    return {
      get: async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        const docs = this.db.getCollection(this.path);
        const filtered = Object.entries(docs).filter(([id, data]: [string, any]) => {
          switch (operator) {
            case '==':
              return data[field] === value;
            case '!=':
              return data[field] !== value;
            case '>':
              return data[field] > value;
            case '<':
              return data[field] < value;
            case '>=':
              return data[field] >= value;
            case '<=':
              return data[field] <= value;
            case 'array-contains':
              return Array.isArray(data[field]) && data[field].includes(value);
            default:
              return true;
          }
        });
        const snapshots = filtered.map(([id, data]) => 
          new MockDocumentSnapshot(id, data)
        );
        return new MockQuerySnapshot(snapshots);
      },
      limit: (n: number) => ({
        get: async () => {
          const result = await this.where(field, operator, value).get();
          result.docs = result.docs.slice(0, n);
          result.size = result.docs.length;
          return result;
        }
      }),
      orderBy: (orderField: string, direction = 'asc') => ({
        get: async () => {
          const result = await this.where(field, operator, value).get();
          result.docs.sort((a, b) => {
            const aVal = a.data()[orderField];
            const bVal = b.data()[orderField];
            if (direction === 'asc') {
              return aVal > bVal ? 1 : -1;
            } else {
              return aVal < bVal ? 1 : -1;
            }
          });
          return result;
        }
      })
    };
  }

  orderBy(field: string, direction = 'asc') {
    return {
      get: async () => {
        const result = await this.get();
        result.docs.sort((a, b) => {
          const aVal = a.data()[field];
          const bVal = b.data()[field];
          if (direction === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
        return result;
      },
      limit: (n: number) => ({
        get: async () => {
          const result = await this.orderBy(field, direction).get();
          result.docs = result.docs.slice(0, n);
          result.size = result.docs.length;
          return result;
        }
      })
    };
  }
}

class MockFirestore {
  private data: { [collection: string]: { [doc: string]: any } } = {};

  constructor() {
    // Carregar dados do localStorage
    const saved = localStorage.getItem('mockFirestore');
    if (saved) {
      this.data = JSON.parse(saved);
    }
  }

  private save() {
    localStorage.setItem('mockFirestore', JSON.stringify(this.data));
  }

  collection(path: string) {
    if (!this.data[path]) {
      this.data[path] = {};
    }
    return new MockCollectionReference(path, this);
  }

  getDocument(collection: string, id: string) {
    return this.data[collection]?.[id] || null;
  }

  setDocument(collection: string, id: string, data: any) {
    if (!this.data[collection]) {
      this.data[collection] = {};
    }
    this.data[collection][id] = data;
    this.save();
  }

  deleteDocument(collection: string, id: string) {
    if (this.data[collection]?.[id]) {
      delete this.data[collection][id];
      this.save();
    }
  }

  getCollection(collection: string) {
    return this.data[collection] || {};
  }
}

// Instância única do mock firestore
const firestoreInstance = new MockFirestore();

// Adicionar alguns dados iniciais de exemplo
const initializeMockData = () => {
  const habits = firestoreInstance.collection('habits');
  
  // Verificar se já tem dados
  habits.get().then(snapshot => {
    if (snapshot.size === 0) {
      // Adicionar hábitos de exemplo
      habits.add({
        name: 'Beber água',
        description: 'Beber 2 litros de água por dia',
        frequency: 'daily',
        reminder: true,
        createdAt: new Date()
      });
      
      habits.add({
        name: 'Exercícios',
        description: '30 minutos de exercícios',
        frequency: 'daily',
        reminder: false,
        createdAt: new Date()
      });
      
      habits.add({
        name: 'Leitura',
        description: 'Ler 20 páginas por dia',
        frequency: 'daily',
        reminder: true,
        createdAt: new Date()
      });
    }
  });
};

// Inicializar dados de exemplo
setTimeout(initializeMockData, 1000);

export default () => firestoreInstance;
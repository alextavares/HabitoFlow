// Mock do Firebase Storage para desenvolvimento web
class MockStorageReference {
  private path: string;

  constructor(path: string) {
    this.path = path;
  }

  child(path: string) {
    return new MockStorageReference(`${this.path}/${path}`);
  }

  async put(file: Blob | Uint8Array | ArrayBuffer, metadata?: any) {
    console.log('[MOCK] Storage upload:', this.path, metadata);
    
    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      state: 'success',
      metadata: {
        fullPath: this.path,
        size: file instanceof Blob ? file.size : 0,
        contentType: metadata?.contentType || 'application/octet-stream'
      }
    };
  }

  async putFile(filePath: string, metadata?: any) {
    console.log('[MOCK] Storage file upload:', filePath, 'to', this.path);
    
    // Simular upload
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      state: 'success',
      metadata: {
        fullPath: this.path,
        size: 1024,
        contentType: metadata?.contentType || 'application/octet-stream'
      }
    };
  }

  async getDownloadURL() {
    // Retornar URL mock
    return `https://firebasestorage.googleapis.com/mock/b/bucket/o/${encodeURIComponent(this.path)}?alt=media&token=mock-token`;
  }

  async delete() {
    console.log('[MOCK] Storage delete:', this.path);
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  async getMetadata() {
    return {
      fullPath: this.path,
      size: 1024,
      contentType: 'image/jpeg',
      timeCreated: new Date().toISOString(),
      updated: new Date().toISOString()
    };
  }

  async list(options?: any) {
    console.log('[MOCK] Storage list:', this.path, options);
    return {
      items: [],
      prefixes: [],
      nextPageToken: null
    };
  }
}

const storageMock = () => ({
  ref: (path?: string) => new MockStorageReference(path || ''),
  
  refFromURL: (url: string) => {
    // Extrair path da URL
    const match = url.match(/o\/(.+)\?/);
    const path = match ? decodeURIComponent(match[1]) : '';
    return new MockStorageReference(path);
  },
  
  setMaxUploadRetryTime: (time: number) => {
    console.log('[MOCK] Storage max upload retry time set to:', time);
  },
  
  setMaxDownloadRetryTime: (time: number) => {
    console.log('[MOCK] Storage max download retry time set to:', time);
  },
  
  setMaxOperationRetryTime: (time: number) => {
    console.log('[MOCK] Storage max operation retry time set to:', time);
  }
});

export default storageMock;
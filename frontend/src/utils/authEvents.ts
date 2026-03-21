// Simple event emitter for auth events
type AuthEventListener = () => void;

class AuthEventEmitter {
  private listeners: AuthEventListener[] = [];

  subscribe(listener: AuthEventListener): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(): void {
    this.listeners.forEach(listener => listener());
  }
}

export const sessionExpiredEvent = new AuthEventEmitter();

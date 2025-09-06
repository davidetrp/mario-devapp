export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
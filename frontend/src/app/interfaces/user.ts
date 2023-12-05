export interface AuthUser {
  jwt: string,
  user: User
}

export interface User {
  id: number,
  username: string,
  email: string,
  provider: string,
  confirmed: boolean,
  blocked: boolean,
  createdAt: string,
  updatedAt: string,
  settings: Settings | null,
}

export interface Settings {
  units: 'kg' | 'gr',
}

export interface RegisterUserData {
  username: string;
  email: string;
  password: string;
}
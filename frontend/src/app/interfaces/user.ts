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
}

export interface RegisterUserData {
  username: string;
  email: string;
  password: string;
}
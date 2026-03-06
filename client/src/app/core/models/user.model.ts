export interface User {
  userId: number; // or id, depending on your NestJS payload
  email: string;
  role: 'user' | 'admin';
}
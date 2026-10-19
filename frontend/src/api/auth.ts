import type { DemoUser, Session } from '../auth/session';
import { api } from './client';

export async function fetchDemoUsers(): Promise<DemoUser[]> {
  const { data } = await api.get<DemoUser[]>('/auth/users');
  return data;
}

export async function loginRequest(username: string): Promise<Session> {
  const { data } = await api.post<Session>('/auth/login', { username });
  return data;
}

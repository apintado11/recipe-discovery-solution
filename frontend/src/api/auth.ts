import type { RegisterInput, Session } from '../auth/session';
import { api } from './client';

export type { RegisterInput };

export type LocalMessage = {
  id: string;
  to: string;
  subject: string;
  body: string;
  resetUrl: string;
  sentAt: string;
};

export async function loginRequest(email: string, password: string): Promise<Session> {
  const { data } = await api.post<Session>('/auth/login', { email, password });
  return data;
}

export async function registerRequest(input: RegisterInput): Promise<Session> {
  const { data } = await api.post<Session>('/auth/register', input);
  return data;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}

export async function forgotPassword(email: string): Promise<{ accepted: boolean; localDelivery: boolean }> {
  const { data } = await api.post<{ accepted: boolean; localDelivery: boolean }>('/auth/forgot-password', { email });
  return data;
}

export async function fetchMailbox(email: string): Promise<LocalMessage[]> {
  const { data } = await api.get<{ messages: LocalMessage[] }>('/auth/mailbox', { params: { email } });
  return data.messages;
}

export async function resetPassword(token: string, password: string): Promise<void> {
  await api.post('/auth/reset-password', { token, password });
}

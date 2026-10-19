import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { loginRequest } from '../api/auth';
import { apolloClient } from '../graphql/client';
import { readSession, writeSession, type Session } from './session';

type AuthContextValue = {
  session: Session | null;
  login: (username: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession());

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      async login(username: string) {
        const next = await loginRequest(username);
        writeSession(next);
        setSession(next);
      },
      logout() {
        writeSession(null);
        setSession(null);
        void apolloClient.clearStore();
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return value;
}

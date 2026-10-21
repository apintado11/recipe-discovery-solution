import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { loginRequest, logoutRequest, registerRequest } from '../api/auth';
import { apolloClient } from '../graphql/client';
import { readSession, writeSession, type RegisterInput, type Session } from './session';

type AuthContextValue = {
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession());

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      async login(email: string, password: string) {
        await adopt(await loginRequest(email.trim(), password), setSession);
      },
      async register(input: RegisterInput) {
        await adopt(
          await registerRequest({
            name: input.name.trim(),
            email: input.email.trim(),
            password: input.password,
          }),
          setSession,
        );
      },
      async logout() {
        try {
          if (readSession()) {
            await logoutRequest();
          }
        } catch {
          // The session still ends on this device if the API is unreachable.
        }
        writeSession(null);
        setSession(null);
        await apolloClient.clearStore();
      },
    }),
    [session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

async function adopt(next: Session, setSession: (session: Session) => void) {
  writeSession(next);
  setSession(next);
  await apolloClient.clearStore();
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return value;
}

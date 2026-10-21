export type AuthUser = {
  id: string;
  username: string;
  email: string;
};

export type Session = {
  token: string;
  user: AuthUser;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

const STORAGE_KEY = 'recipe-session';

export const sampleKitchens = [
  { name: 'Alex', email: 'alex@recipe.test' },
  { name: 'Blair', email: 'blair@recipe.test' },
  { name: 'Casey', email: 'casey@recipe.test' },
] as const;

export const samplePassword = 'cookbook';

export function readSession(): Session | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.token || !parsed.user?.id || !parsed.user.username) {
      return null;
    }
    return {
      token: parsed.token,
      user: {
        id: parsed.user.id,
        username: parsed.user.username,
        email: parsed.user.email ?? '',
      },
    };
  } catch {
    return null;
  }
}

export function writeSession(session: Session | null) {
  if (session) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return;
  }

  sessionStorage.removeItem(STORAGE_KEY);
}

export function displayName(username: string) {
  if (username.length === 0) {
    return username;
  }

  return username.slice(0, 1).toUpperCase() + username.slice(1);
}

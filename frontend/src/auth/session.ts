export type DemoUser = {
  id: string;
  username: string;
};

export type Session = {
  token: string;
  user: DemoUser;
};

const STORAGE_KEY = 'recipe-session';

export function readSession(): Session | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Session;
    if (!parsed.token || !parsed.user?.id) {
      return null;
    }
    return parsed;
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

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider } from '@mui/material/styles';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildTheme, looks, type Look, type LookId } from './theme';

const STORAGE_KEY = 'recipe-discovery-theme';

type LookChoice = { look: Look; setLook: (id: LookId) => void };

const LookContext = createContext<LookChoice>({ look: looks.journal, setLook: () => undefined });

function readStoredLook(): LookId {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored && stored in looks) {
      return stored as LookId;
    }
  } catch {
    // Storage can be blocked; the default look still works.
  }
  return 'journal';
}

export function LookProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<LookId>(readStoredLook);
  const look = looks[id];
  const muiTheme = useMemo(() => buildTheme(look), [look]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Ignore storage failures; the choice lasts for this visit.
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', look.page);
  }, [id, look.page]);

  const value = useMemo(() => ({ look, setLook: setId }), [look]);

  return (
    <LookContext.Provider value={value}>
      <ThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </LookContext.Provider>
  );
}

export function useLook(): Look {
  return useContext(LookContext).look;
}

export function useLookChoice(): LookChoice {
  return useContext(LookContext);
}

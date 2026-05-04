import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { LANGS, STR, type LangCode, type Translations } from "@/lib/i18n";

const STORAGE_KEY = "@mafia-x/lang";
const DEFAULT_LANG: LangCode = "ka";

interface LanguageContextValue {
  lang: LangCode;
  setLang: (l: LangCode) => Promise<void>;
  t: (entry: Translations) => string;
  S: typeof STR;
  langs: typeof LANGS;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(
  undefined,
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<LangCode>(DEFAULT_LANG);

  useEffect(() => {
    (async () => {
      try {
        const v = await AsyncStorage.getItem(STORAGE_KEY);
        if (v && LANGS.some((l) => l.code === v)) {
          setLangState(v as LangCode);
        }
      } catch {
        /* ignore */
      }
    })();
  }, []);

  const setLang = useCallback(async (l: LangCode) => {
    setLangState(l);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  const tFn = useCallback(
    (entry: Translations) => entry[lang] ?? entry.en ?? "",
    [lang],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, setLang, t: tFn, S: STR, langs: LANGS }),
    [lang, setLang, tFn],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be inside LanguageProvider");
  return ctx;
}

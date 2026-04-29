"use client";

import { useCallback, useEffect, useState } from "react";
import { translations, type Language, type TranslationKey } from "./translations";

const STORAGE_KEY = "app_lang";

export function useTranslation() {
  const [lang, setLangState] = useState<Language>("en");

  useEffect(() => {
    const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
    if (savedLang && translations[savedLang]) {
      setLangState(savedLang);
    }
  }, []);

  const setLang = useCallback((newLang: Language) => {
    localStorage.setItem(STORAGE_KEY, newLang);
    setLangState(newLang);
    // Trigger storage event for other tabs/components
    window.dispatchEvent(new Event("storage"));
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const savedLang = localStorage.getItem(STORAGE_KEY) as Language;
      if (savedLang && translations[savedLang]) {
        setLangState(savedLang);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const t = useCallback(
    (key: TranslationKey) => {
      return translations[lang][key] || translations["en"][key] || key;
    },
    [lang]
  );

  return { t, lang, setLang };
}

"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { en } from "./en";
import { uz } from "./uz";
import { ru } from "./ru";
import { Language } from "@/types";

export type TranslationKey = keyof typeof en;

const translations: Record<Language, typeof en> = {
  en,
  uz: uz as typeof en,
  ru: ru as typeof en,
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("uz");

  useEffect(() => {
    const saved = localStorage.getItem("bt_language") as Language;
    if (saved && (saved === "en" || saved === "uz" || saved === "ru")) {
      setLanguageState(saved);
    } else {
      setLanguageState("uz");
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("bt_language", lang);
  };

  const t = (key: TranslationKey): string => {
    const dict = translations[language] || en;
    return dict[key] || en[key] || (key as string);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return context;
}

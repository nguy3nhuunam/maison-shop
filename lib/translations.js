import vi from "@/locales/vi.json";
import zh from "@/locales/zh.json";

export const LANGUAGE_KEY = "maison-language";
export const translations = { vi, zh };

function interpolate(template, params = {}) {
  return Object.entries(params).reduce(
    (result, [key, value]) => result.replaceAll(`{{${key}}}`, String(value)),
    template,
  );
}

export function createTranslator(language = "vi") {
  const dictionary = translations[language] || translations.vi;

  const translator = (key, params) => {
    const fallback = translations.vi[key];
    const value = dictionary[key] ?? fallback ?? key;
    return typeof value === "string" ? interpolate(value, params) : value;
  };

  translator.language = language;
  translator.dictionary = dictionary;

  return new Proxy(translator, {
    get(target, property, receiver) {
      if (typeof property === "string" && (property in dictionary || property in translations.vi)) {
        return dictionary[property] ?? translations.vi[property] ?? property;
      }

      if (Reflect.has(target, property)) {
        return Reflect.get(target, property, receiver);
      }

      return dictionary[property];
    },
  });
}

export function getTranslation(language = "vi") {
  return createTranslator(language);
}

export function getStoredLanguage() {
  if (typeof window === "undefined") {
    return "vi";
  }

  return window.localStorage.getItem(LANGUAGE_KEY) === "zh" ? "zh" : "vi";
}

export function setStoredLanguage(language) {
  if (typeof window === "undefined") {
    return;
  }

  const nextLanguage = language === "zh" ? "zh" : "vi";
  window.localStorage.setItem(LANGUAGE_KEY, nextLanguage);
  window.dispatchEvent(
    new CustomEvent("maison-language-change", {
      detail: { language: nextLanguage },
    }),
  );
}

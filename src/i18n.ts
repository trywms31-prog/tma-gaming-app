import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uk from "./locales/uk.json";
import en from "./locales/en.json";

const saved = localStorage.getItem("lang");

void i18n.use(initReactI18next).init({
  resources: {
    uk: { translation: uk },
    en: { translation: en },
  },
  lng: saved === "en" ? "en" : "uk",
  fallbackLng: "uk",
  interpolation: { escapeValue: false },
});

export default i18n;

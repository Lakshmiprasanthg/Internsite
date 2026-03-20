import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enCommon from "../locales/en/common.json";
import esCommon from "../locales/es/common.json";
import hiCommon from "../locales/hi/common.json";
import ptCommon from "../locales/pt/common.json";
import zhCommon from "../locales/zh/common.json";
import frCommon from "../locales/fr/common.json";

const resources = {
  en: { translation: enCommon },
  es: { translation: esCommon },
  hi: { translation: hiCommon },
  pt: { translation: ptCommon },
  zh: { translation: zhCommon },
  fr: { translation: frCommon },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "en",
    lng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

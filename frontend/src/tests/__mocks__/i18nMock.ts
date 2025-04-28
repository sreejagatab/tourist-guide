// Mock i18n instance for testing
const i18n = {
  language: 'en',
  options: {
    fallbackLng: 'en',
    resources: {
      en: {},
      es: {},
      fr: {},
      de: {},
      it: {},
      zh: {},
      ja: {}
    },
    interpolation: {
      escapeValue: false
    }
  },
  t: (key: string) => key,
  changeLanguage: jest.fn()
};

export default i18n;

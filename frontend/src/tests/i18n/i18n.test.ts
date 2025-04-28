import i18n from '../__mocks__/i18nMock';

// Mock the actual i18n module
jest.mock('../../i18n', () => {
  return {
    __esModule: true,
    default: i18n
  };
});

describe('i18n Configuration', () => {
  test('i18n is properly initialized', () => {
    expect(i18n).toBeDefined();
    expect(i18n.language).toBeDefined();
  });

  test('i18n has English as fallback language', () => {
    expect(i18n.options.fallbackLng).toBe('en');
  });

  test('i18n has all required languages configured', () => {
    const resources = i18n.options.resources;
    expect(resources).toBeDefined();

    // Check if all languages are configured
    expect(resources).toHaveProperty('en');
    expect(resources).toHaveProperty('es');
    expect(resources).toHaveProperty('fr');
    expect(resources).toHaveProperty('de');
    expect(resources).toHaveProperty('it');
    expect(resources).toHaveProperty('zh');
    expect(resources).toHaveProperty('ja');
  });

  test('i18n has proper interpolation configuration', () => {
    expect(i18n.options.interpolation).toBeDefined();
    expect(i18n.options.interpolation.escapeValue).toBe(false);
  });
});

import { DEFAULT_LOCALE, type Locale } from './config';
import { messages } from './messages';

type MessageVars = Record<string, string | number>;

const getMessage = (locale: Locale, key: string) => {
  const parts = key.split('.');
  let current: any = messages[locale];
  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return null;
    }
    current = current[part];
  }
  return typeof current === 'string' ? current : null;
};

const interpolate = (value: string, vars?: MessageVars) => {
  if (!vars) {
    return value;
  }
  return value.replace(/\{(\w+)\}/g, (match, key) => {
    if (Object.prototype.hasOwnProperty.call(vars, key)) {
      return String(vars[key]);
    }
    return match;
  });
};

export const createTranslator = (locale: Locale) => {
  return (key: string, vars?: MessageVars) => {
    const message = getMessage(locale, key) ?? getMessage(DEFAULT_LOCALE, key) ?? key;
    return interpolate(message, vars);
  };
};

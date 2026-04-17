import en from './en';
import ar from './ar';
import fr from './fr';

export type Language = 'en' | 'ar' | 'fr';
export type Translations = typeof en;

const translations: Record<Language, Translations> = { en, ar, fr };

export default translations;

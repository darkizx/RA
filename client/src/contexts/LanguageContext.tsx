import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string, lang?: Language) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations: Record<string, Record<Language, string>> = {
  'app.title': { ar: 'أكاديمية الفلاح', en: 'Al Falah Academy' },
  'app.subtitle': { ar: 'مساعد الدراسة الذكي', en: 'Smart Study Bot' },
  'app.students': { ar: 'الطلاب: محمد عبدالله و مبين عبدالله', en: 'Students: Muhammad Abdullah & Mubeen Abdullah' },
  
  // Subjects
  'subject.mathematics': { ar: 'الرياضيات', en: 'Mathematics' },
  'subject.physics': { ar: 'الفيزياء', en: 'Physics' },
  'subject.chemistry': { ar: 'الكيمياء', en: 'Chemistry' },
  'subject.biology': { ar: 'الأحياء', en: 'Biology' },
  'subject.arabic': { ar: 'اللغة العربية', en: 'Arabic' },
  'subject.english': { ar: 'اللغة الإنجليزية', en: 'English' },
  'subject.islamic': { ar: 'التربية الإسلامية', en: 'Islamic Education' },
  'subject.social': { ar: 'الدراسات الاجتماعية', en: 'Social Studies' },
  
  // Subject descriptions
  'subject.mathematics.desc': { ar: 'الأرقام والمعادلات والحسابات', en: 'Numbers, equations, and calculations' },
  'subject.physics.desc': { ar: 'الحركة والقوى والطاقة', en: 'Motion, forces, and energy' },
  'subject.chemistry.desc': { ar: 'العناصر والمركبات والتفاعلات', en: 'Elements, compounds, and reactions' },
  'subject.biology.desc': { ar: 'الحياة والكائنات الحية', en: 'Life and living organisms' },
  'subject.arabic.desc': { ar: 'النحو والأدب واللغة', en: 'Grammar, literature, and language' },
  'subject.english.desc': { ar: 'اللغة الإنجليزية والقواعس', en: 'English language and grammar' },
  'subject.islamic.desc': { ar: 'الدين والأخلاق والعبادة', en: 'Religion, ethics, and worship' },
  'subject.social.desc': { ar: 'التاريخ والجغرافيا والمجتمع', en: 'History, geography, and society' },
  
  // Common UI
  'ui.language': { ar: 'اللغة', en: 'Language' },
  'ui.selectSubject': { ar: 'اختر مادة دراسية', en: 'Select a Subject' },
  'ui.askQuestion': { ar: 'اسأل سؤالاً', en: 'Ask a Question' },
  'ui.uploadImage': { ar: 'رفع صورة', en: 'Upload Image' },
  'ui.send': { ar: 'إرسال', en: 'Send' },
  'ui.back': { ar: 'العودة', en: 'Back' },
  'ui.chat': { ar: 'الدردشة', en: 'Chat' },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('ar');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const t = (key: string, lang?: Language): string => {
    const targetLang = lang || language;
    return translations[key]?.[targetLang] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}


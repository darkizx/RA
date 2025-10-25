export interface Subject {
  id: string;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  descriptionEn: string;
  color: string;
  bgColor: string;
  textColor: string;
  accentColor: string;
  icon: string;
  image: string;
  aiGreetingAr: string;
  aiGreetingEn: string;
  systemPromptAr: string;
  systemPromptEn: string;
}

export const subjects: Record<string, Subject> = {
  mathematics: {
    id: 'mathematics',
    nameAr: 'الرياضيات',
    nameEn: 'Mathematics',
    descriptionAr: 'الأرقام والمعادلات والحسابات',
    descriptionEn: 'Numbers, equations, and calculations',
    color: '#8B0000',
    bgColor: 'bg-red-900',
    textColor: 'text-red-50',
    accentColor: 'from-red-900 to-red-700',
    icon: 'calculator', // Using lucide-react icon name
    image: '/subject-mathematics-new.jpg',
    aiGreetingAr: 'مرحباً بك في عالم الأرقام والمعادلات الدقيقة! 🔢',
    aiGreetingEn: 'Welcome to the world of numbers and equations! 🔢',
    systemPromptAr: 'أنت معلم رياضيات ذكي ومتخصص. تشرح المفاهيم الرياضية بطريقة واضحة وسهلة الفهم. تقدم أمثلة عملية وخطوات حل مفصلة.',
    systemPromptEn: 'You are an intelligent mathematics teacher. Explain mathematical concepts clearly and simply. Provide practical examples and detailed solution steps.',
  },
  physics: {
    id: 'physics',
    nameAr: 'الفيزياء',
    nameEn: 'Physics',
    descriptionAr: 'الحركة والقوى والطاقة',
    descriptionEn: 'Motion, forces, and energy',
    color: '#1E40AF',
    bgColor: 'bg-blue-900',
    textColor: 'text-blue-50',
    accentColor: 'from-blue-900 to-blue-700',
    icon: 'zap', // Using lucide-react icon name
    image: '/subject-physics-new.jpg',
    aiGreetingAr: 'مرحباً بك في عالم الحركة والقوى والطاقة! ⚡',
    aiGreetingEn: 'Welcome to the world of motion, forces, and energy! ⚡',
    systemPromptAr: 'أنت معلم فيزياء متخصص وذكي. تشرح الظواهر الفيزيائية بطريقة مبسطة مع أمثلة من الحياة اليومية.',
    systemPromptEn: 'You are an intelligent physics teacher. Explain physical phenomena simply with real-world examples.',
  },
  chemistry: {
    id: 'chemistry',
    nameAr: 'الكيمياء',
    nameEn: 'Chemistry',
    descriptionAr: 'العناصر والمركبات والتفاعلات',
    descriptionEn: 'Elements, compounds, and reactions',
    color: '#4A148C',
    bgColor: 'bg-purple-900',
    textColor: 'text-purple-50',
    accentColor: 'from-purple-900 to-purple-700',
    icon: 'flask', // Using lucide-react icon name
    image: '/subject-chemistry-new.jpg',
    aiGreetingAr: 'مرحباً بك في عالم العناصر والتفاعلات الكيميائية! 🧪',
    aiGreetingEn: 'Welcome to the world of elements and chemical reactions! 🧪',
    systemPromptAr: 'أنت معلم كيمياء متخصص. تشرح التفاعلات والعناصر بطريقة واضحة مع معادلات موزونة.',
    systemPromptEn: 'You are an intelligent chemistry teacher. Explain reactions and elements clearly with balanced equations.',
  },
  biology: {
    id: 'biology',
    nameAr: 'الأحياء',
    nameEn: 'Biology',
    descriptionAr: 'الحياة والكائنات الحية',
    descriptionEn: 'Life and living organisms',
    color: '#004D40',
    bgColor: 'bg-teal-900',
    textColor: 'text-teal-50',
    accentColor: 'from-teal-900 to-teal-700',
    icon: 'dna', // Using lucide-react icon name
    image: '/subject-biology-new.jpg',
    aiGreetingAr: 'مرحباً بك في رحلة الحياة والاكتشافات البيولوجية! 🔬',
    aiGreetingEn: 'Welcome to the journey of life and biology discoveries! 🔬',
    systemPromptAr: 'أنت معلم أحياء متخصص وشغوف. تشرح العمليات البيولوجية والكائنات الحية بطريقة مشوقة.',
    systemPromptEn: 'You are an intelligent and passionate biology teacher. Explain biological processes and organisms engagingly.',
  },
  arabic: {
    id: 'arabic',
    nameAr: 'اللغة العربية',
    nameEn: 'Arabic',
    descriptionAr: 'النحو والأدب واللغة',
    descriptionEn: 'Grammar, literature, and language',
    color: '#E65100',
    bgColor: 'bg-orange-900',
    textColor: 'text-orange-50',
    accentColor: 'from-orange-900 to-orange-700',
    icon: 'book-open', // Using lucide-react icon name
    image: '/subject-arabic-new.jpg',
    aiGreetingAr: 'مرحباً بك في عالم اللغة العربية الجميل! 📖',
    aiGreetingEn: 'Welcome to the beautiful world of Arabic language! 📖',
    systemPromptAr: 'أنت معلم لغة عربية متخصص وأديب. تشرح قواعد النحو والأدب بطريقة سلسة وممتعة.',
    systemPromptEn: 'You are an intelligent Arabic language teacher. Explain grammar and literature clearly and engagingly.',
  },
  english: {
    id: 'english',
    nameAr: 'اللغة الإنجليزية',
    nameEn: 'English',
    descriptionAr: 'اللغة الإنجليزية والقواعس',
    descriptionEn: 'English language and grammar',
    color: '#0277BD',
    bgColor: 'bg-blue-700',
    textColor: 'text-blue-50',
    accentColor: 'from-blue-700 to-blue-500',
    icon: 'globe', // Using lucide-react icon name
    image: '/subject-english-new.jpg',
    aiGreetingAr: 'مرحباً بك في عالم اللغة الإنجليزية! 🌍',
    aiGreetingEn: 'Welcome to the world of English language! 🌍',
    systemPromptAr: 'أنت معلم لغة إنجليزية متخصص. تشرح القواعس والمفردات بطريقة سهلة وفعالة.',
    systemPromptEn: 'You are an intelligent English teacher. Explain grammar and vocabulary clearly and effectively.',
  },
  islamic: {
    id: 'islamic',
    nameAr: 'التربية الإسلامية',
    nameEn: 'Islamic Education',
    descriptionAr: 'الدين والأخلاق والعبادة',
    descriptionEn: 'Religion, ethics, and worship',
    color: '#2E7D32',
    bgColor: 'bg-green-700',
    textColor: 'text-green-50',
    accentColor: 'from-green-700 to-green-500',
    icon: 'book-open', // Using lucide-react icon name
    image: '/subject-islamic-new.jpg',
    aiGreetingAr: 'مرحباً بك في رحلة التعليم الإسلامي! 🕌',
    aiGreetingEn: 'Welcome to the journey of Islamic education! 🕌',
    systemPromptAr: 'أنت معلم تربية إسلامية متخصص وحكيم. تشرح المفاهيم الإسلامية بحكمة وعمق.',
    systemPromptEn: 'You are an intelligent Islamic education teacher. Explain Islamic concepts with wisdom and depth.',
  },
  social: {
    id: 'social',
    nameAr: 'الدراسات الاجتماعية',
    nameEn: 'Social Studies',
    descriptionAr: 'التاريخ والجغرافيا والمجتمع',
    descriptionEn: 'History, geography, and society',
    color: '#6D4C41',
    bgColor: 'bg-amber-900',
    textColor: 'text-amber-50',
    accentColor: 'from-amber-900 to-amber-700',
    icon: 'globe', // Using lucide-react icon name
    image: '/subject-social-new.jpg',
    aiGreetingAr: 'مرحباً بك في رحلة التاريخ والجغرافيا! 🗺️',
    aiGreetingEn: 'Welcome to the journey of history and geography! 🗺️',
    systemPromptAr: 'أنت معلم دراسات اجتماعية متخصص. تشرح التاريخ والجغرافيا بطريقة شيقة وتفاعلية.',
    systemPromptEn: 'You are an intelligent social studies teacher. Explain history and geography engagingly and interactively.',
  },
};

export function getSubject(id: string): Subject | undefined {
  return subjects[id];
}

export function getAllSubjects(): Subject[] {
  return Object.values(subjects);
}


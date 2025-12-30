import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Globe, Calculator, Zap, FlaskConical, Dna, BookOpen, Leaf, Map, Moon, Sun } from "lucide-react";
import { subjects } from "@/lib/subjects";

// Map icon names to lucide-react components
const iconMap: Record<string, React.ReactNode> = {
  calculator: <Calculator className="h-8 w-8" />,
  zap: <Zap className="h-8 w-8" />,
  flask: <FlaskConical className="h-8 w-8" />,
  dna: <Dna className="h-8 w-8" />,
  'book-open': <BookOpen className="h-8 w-8" />,
  globe: <Globe className="h-8 w-8" />,
  leaf: <Leaf className="h-8 w-8" />,
  map: <Map className="h-8 w-8" />,
};

export default function Home() {
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const isArabic = language === "ar";

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-gradient-to-br from-slate-900 to-slate-800"
          : "bg-gradient-to-br from-blue-50 to-indigo-100"
      } ${
        isArabic ? "rtl" : "ltr"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className={`${
        theme === "dark"
          ? "bg-slate-800 border-b border-slate-700"
          : "bg-white"
      } shadow-lg sticky top-0 z-50`}>
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-6 flex items-center justify-between gap-2 sm:gap-4">
          {/* Left Section - Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-6 flex-1 min-w-0">
            <img
              src="/al-falah-logo.png"
              alt="Al Falah Academy"
              className="h-16 sm:h-28 w-auto drop-shadow-xl flex-shrink-0"
            />
            <div className="hidden sm:block">
              <h1 className={`text-2xl sm:text-3xl font-bold ${
              theme === "dark" ? "text-white" : "text-slate-800"
            }`}>
                {isArabic ? "مدرسة الفلاح الخاصة" : "Al Falah Private School"}
              </h1>
              <p className={`text-xs sm:text-base font-medium ${
                theme === "dark" ? "text-slate-300" : "text-slate-600"
              }`}>
                {isArabic
                  ? "مساعدك الدراسي الذكي"
                  : "Your Smart Study Assistant"}
              </p>
            </div>
          </div>

          {/* Center Section - Student Names */}
          <div className="text-center hidden lg:block">
            <p className={`text-xs sm:text-sm font-medium ${
              theme === "dark" ? "text-slate-300" : "text-slate-700"
            }`}>
              {isArabic ? "الطلاب:" : "Students:"}
            </p>
            <p className={`text-xs sm:text-sm ${
              theme === "dark" ? "text-slate-400" : "text-slate-600"
            }`}>
              محمد عبدالله و مبين عبدالله
            </p>
          </div>

          {/* Right Section - Flag, Language, and Theme */}
          <div className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
            <img
              src="/uae-flag.png"
              alt="UAE Flag"
              className="h-6 sm:h-8 w-auto"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-auto"
            >
              <Globe className="h-3 sm:h-4 w-3 sm:w-4" />
              <span className="hidden sm:inline">{language.toUpperCase()}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3 h-8 sm:h-auto"
              title={theme === "dark" ? "Light Mode" : "Dark Mode"}
            >
              {theme === "dark" ? (
                <Sun className="h-3 sm:h-4 w-3 sm:w-4" />
              ) : (
                <Moon className="h-3 sm:h-4 w-3 sm:w-4" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className={`text-4xl font-bold ${
            theme === "dark" ? "text-white" : "text-slate-800"
          } mb-3`}>
            {isArabic ? "اختر مادة دراسية" : "Choose a Subject"}
          </h2>
          <p className={`text-lg ${
            theme === "dark" ? "text-slate-300" : "text-slate-600"
          }`}>
            {isArabic
              ? "اختر المادة الدراسية التي تريد الحصول على مساعدة فيها"
              : "Select the subject you want to get help with"}
          </p>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 max-w-6xl mx-auto px-2 sm:px-0">
          {Object.values(subjects).map((subject: any) => (
            <Card
              key={subject.id}
              className={`cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group flex flex-col h-full ${
                theme === "dark" ? "bg-slate-700" : "bg-white"
              }`}
              onClick={() => setLocation(`/subject/${subject.id}`)}
            >
              {/* Subject Image - Full Width */}
              <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-slate-300 flex-shrink-0">
                <img
                  src={subject.image}
                  alt={isArabic ? subject?.nameAr : subject?.nameEn}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  style={{ objectPosition: 'center' }}
                />
                {/* Icon Badge in Top-Left */}
                <div className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-lg flex items-center justify-center">
                  <div className="text-slate-700">{iconMap[subject.icon] || subject.icon}</div>
                </div>
              </div>

              {/* White Content Section Below Image */}
              <div className={`p-4 sm:p-6 ${
                theme === "dark" ? "bg-slate-700" : "bg-white"
              } flex-grow flex flex-col justify-between`}>
                {/* Title and Description */}
                <div>
                  <h3 className={`text-base sm:text-lg font-bold ${
                    theme === "dark" ? "text-white" : "text-slate-800"
                  } mb-2`}>
                    {isArabic ? subject.nameAr : subject.nameEn}
                  </h3>
                  <p className={`text-xs sm:text-sm ${
                    theme === "dark" ? "text-slate-300" : "text-slate-600"
                  } line-clamp-2`}>
                    {isArabic
                      ? subject.descriptionAr
                      : subject.descriptionEn}
                  </p>
                </div>

                {/* Start Button */}
                <button 
                  className="mt-3 sm:mt-4 w-full py-2 sm:py-3 px-4 text-white font-semibold text-sm sm:text-base rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: subject.color,
                    backgroundImage: `linear-gradient(135deg, ${subject.color}, ${subject.accentColor})`
                  }}
                >
                  <span>{isArabic ? "ابدأ الآن" : "Start Now"}</span>
                  <span>{isArabic ? "←" : "→"}</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className={`${
        theme === "dark" ? "bg-slate-950" : "bg-slate-800"
      } text-white mt-16 py-8`}>
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-75">
            {isArabic
              ? "© مدرسة الفلاح الخاصة 2026 - مساعدك الدراسي الذكي"
              : "© Al Falah Private School 2026 - Your Smart Study Assistant"}
          </p>
          <p className="text-xs opacity-50 mt-2">
            {isArabic
              ? "تم تطويره بواسطة فريق الفلاح"
              : "Developed by Al Falah Team"}
          </p>
        </div>
      </footer>


    </div>
  );
}


import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Globe } from "lucide-react";
import { subjects } from "@/lib/subjects";

export default function Home() {
  const { language, toggleLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  const isArabic = language === "ar";

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${
        isArabic ? "rtl" : "ltr"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Left Section - Logo and Title */}
          <div className="flex items-center gap-4">
            <img
              src="/logo.png"
              alt="Al Falah Academy"
              className="h-12 w-auto"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {isArabic ? "أكاديمية الفلاح" : "Al Falah Academy"}
              </h1>
              <p className="text-sm text-slate-600">
                {isArabic
                  ? "مساعدك الدراسي الذكي"
                  : "Your Smart Study Assistant"}
              </p>
            </div>
          </div>

          {/* Center Section - Student Names */}
          <div className="text-center hidden md:block">
            <p className="text-sm text-slate-700 font-medium">
              {isArabic ? "الطلاب:" : "Students:"}
            </p>
            <p className="text-sm text-slate-600">
              محمد عبدالله و مبين عبدالله
            </p>
          </div>

          {/* Right Section - Flag and Language */}
          <div className="flex items-center gap-4">
            <img
              src="/uae-flag.png"
              alt="UAE Flag"
              className="h-8 w-auto"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              {language.toUpperCase()}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-3">
            {isArabic ? "اختر مادة دراسية" : "Choose a Subject"}
          </h2>
          <p className="text-lg text-slate-600">
            {isArabic
              ? "اختر المادة الدراسية التي تريد الحصول على مساعدة فيها"
              : "Select the subject you want to get help with"}
          </p>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {Object.values(subjects).map((subject: any) => (
            <Card
              key={subject.id}
              className="cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 group flex flex-col h-full bg-white"
              onClick={() => setLocation(`/subject/${subject.id}`)}
            >
              {/* Subject Image - Full Width */}
              <div className="relative w-full h-48 overflow-hidden bg-slate-300 flex-shrink-0">
                <img
                  src={subject.image}
                  alt={isArabic ? subject?.nameAr : subject?.nameEn}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  style={{ objectPosition: 'center' }}
                />
                {/* Icon Badge in Top-Left */}
                <div className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-lg">
                  <span className="text-2xl">{subject.icon}</span>
                </div>
              </div>

              {/* White Content Section Below Image */}
              <div className="p-6 bg-white flex-grow flex flex-col justify-between">
                {/* Title and Description */}
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-2">
                    {isArabic ? subject.nameAr : subject.nameEn}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2">
                    {isArabic
                      ? subject.descriptionAr
                      : subject.descriptionEn}
                  </p>
                </div>

                {/* Start Button */}
                <button className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                  <span>{isArabic ? "ابدأ الآن" : "Start Now"}</span>
                  <span>{isArabic ? "←" : "→"}</span>
                </button>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm opacity-75">
            {isArabic
              ? "© أكاديمية الفلاح 2024 - مساعدك الدراسي الذكي"
              : "© Al Falah Academy 2024 - Your Smart Study Assistant"}
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


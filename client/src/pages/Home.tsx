import { useLanguage } from "@/contexts/LanguageContext";
import { getAllSubjects } from "@/lib/subjects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Globe } from "lucide-react";
import WelcomeBot from "@/components/WelcomeBot";

export default function Home() {
  const { language, toggleLanguage, t } = useLanguage();
  const [, setLocation] = useLocation();
  const subjects = getAllSubjects();
  const isArabic = language === "ar";

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ${
        isArabic ? "rtl" : "ltr"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <img
                src="/al-falah-logo.png"
                alt="Al Falah Academy"
                className="h-16 w-16 object-contain"
              />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  {t("app.title")}
                </h1>
                <p className="text-sm text-slate-600">{t("app.subtitle")}</p>
              </div>
            </div>

            {/* Language Switcher */}
            <Button
              onClick={toggleLanguage}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Globe className="h-4 w-4" />
              {language === "ar" ? "EN" : "AR"}
            </Button>
          </div>

          {/* UAE Flag and Students */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <img
              src="/uae-flag.png"
              alt="UAE Flag"
              className="h-8 w-12 object-cover rounded"
            />
            <p className="text-sm font-medium text-slate-700">
              {t("app.students")}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {/* Section Title */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-slate-800 mb-2">
            {t("ui.selectSubject")}
          </h2>
          <p className="text-slate-600">
            {isArabic
              ? "اختر المادة الدراسية التي تريد الحصول على مساعدة فيها"
              : "Choose a subject to get help with your studies"}
          </p>
        </div>

        {/* Subject Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjects.map((subject) => (
            <Card
              key={subject.id}
              className={`cursor-pointer overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 group`}
              onClick={() => setLocation(`/subject/${subject.id}`)}
            >
              {/* Subject Image Background */}
              <div className="relative h-48 overflow-hidden bg-slate-200">
                <img
                  src={subject.image}
                  alt={isArabic ? subject.nameAr : subject.nameEn}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
              </div>

              {/* Content Section */}
              <div className={`p-6 bg-gradient-to-br ${subject.accentColor} ${subject.textColor}`}>
                {/* Icon and Title */}
                <div>
                  <div className="text-4xl mb-3">{subject.icon}</div>
                  <h3 className="text-xl font-bold mb-2">
                    {isArabic ? subject.nameAr : subject.nameEn}
                  </h3>
                  <p className="text-sm opacity-90">
                    {isArabic
                      ? subject.descriptionAr
                      : subject.descriptionEn}
                  </p>
                </div>

                {/* Arrow Indicator */}
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold group-hover:translate-x-1 transition-transform duration-300">
                  {isArabic ? "←" : "→"}
                  <span>
                    {isArabic ? "ابدأ الآن" : "Start Now"}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white mt-16 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            {isArabic
              ? "© 2024 أكاديمية الفلاح - مساعد الدراسة الذكي"
              : "© 2024 Al Falah Academy - Smart Study Bot"}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            {isArabic
              ? "تم تطويره بواسطة فريق الفلاح"
              : "Developed by Al Falah Team"}
          </p>
        </div>
      </footer>

      {/* Welcome Bot */}
      <WelcomeBot />
    </div>
  );
}


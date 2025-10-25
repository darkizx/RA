import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Globe, Calculator, Zap, FlaskConical, Dna, BookOpen, Leaf, Map, MessageCircle } from "lucide-react";
import { subjects } from "@/lib/subjects";
import { useState } from "react";

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
  const [, setLocation] = useLocation();
  const isArabic = language === "ar";
  const [showRobotChat, setShowRobotChat] = useState(false);
  const [robotMessage, setRobotMessage] = useState(
    isArabic
      ? "مرحباً! 👋 أنا روبوتك الذكي. كيف يمكنني مساعدتك؟"
      : "Hello! 👋 I'm your smart robot. How can I help?"
  );

  const handleRobotClick = () => {
    setShowRobotChat(!showRobotChat);
    if (!showRobotChat) {
      const messages = isArabic
        ? [
            "مرحباً! أنا هنا لمساعدتك في رحلتك التعليمية",
            "اختر أي مادة من المواد أعلاه لتبدأ التعلم",
            "يمكنك أيضاً تبديل اللغة باستخدام الزر في الأعلى",
          ]
        : [
            "Hello! I'm here to help you with your learning journey",
            "Choose any subject above to start learning",
            "You can also switch languages using the button at the top",
          ];
      setRobotMessage(messages[Math.floor(Math.random() * messages.length)]);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 ${
        isArabic ? "rtl" : "ltr"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          {/* Top Row - Logo and Title */}
          <div className="flex items-center justify-between mb-4">
            {/* Left Section - Logo and Title */}
            <div className="flex items-center gap-4">
              <img
                src="/logo.png"
                alt="Al Falah Academy"
                className="h-16 w-auto drop-shadow-lg"
              />
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {isArabic ? "أكاديمية الفلاح" : "Al Falah Academy"}
                </h1>
                <p className="text-sm text-blue-100">
                  {isArabic
                    ? "مساعدك الدراسي الذكي"
                    : "Your Smart Study Assistant"}
                </p>
              </div>
            </div>

            {/* Right Section - Flag and Language */}
            <div className="flex items-center gap-4">
              <img
                src="/uae-flag.png"
                alt="UAE Flag"
                className="h-10 w-auto drop-shadow-lg"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center gap-2 bg-white text-blue-600 hover:bg-blue-50"
              >
                <Globe className="h-4 w-4" />
                {language.toUpperCase()}
              </Button>
            </div>
          </div>

          {/* Bottom Row - Student Names and Project Name */}
          <div className="flex items-center justify-between text-white">
            <div>
              <p className="text-sm font-medium opacity-90">
                {isArabic ? "الطلاب:" : "Students:"}
              </p>
              <p className="text-base font-semibold">
                محمد عبدالله و مبين عبدالله
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium opacity-90">
                {isArabic ? "منفذين مشروع اسمي" : "Implementing My Project"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs opacity-75">
                {isArabic ? "مدرسة الفلاح الخاصة" : "Al Falah Private School"}
              </p>
            </div>
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
                <div className="absolute top-3 left-3 bg-white rounded-full p-2 shadow-lg flex items-center justify-center">
                  <div className="text-slate-700">{iconMap[subject.icon] || subject.icon}</div>
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

      {/* Welcome Robot - Interactive */}
      <div className="fixed bottom-6 right-6 z-40">
        {/* Robot Chat Bubble */}
        {showRobotChat && (
          <div className="bg-white rounded-2xl shadow-2xl p-6 mb-4 max-w-xs border-2 border-blue-500 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-grow">
                <p className="text-sm text-slate-800 font-medium mb-2">
                  {isArabic ? "روبوتك الذكي" : "Your Smart Robot"}
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {robotMessage}
                </p>
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowRobotChat(false)}
                className="flex-1 px-3 py-2 bg-slate-200 text-slate-800 rounded-lg text-xs font-medium hover:bg-slate-300 transition-colors"
              >
                {isArabic ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        )}

        {/* Robot Character */}
        <div
          onClick={handleRobotClick}
          className="w-20 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-2xl flex flex-col items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-300 relative group"
        >
          {/* Robot Head - Visor */}
          <div className="w-16 h-10 bg-slate-800 rounded-xl border-2 border-white flex items-center justify-center gap-2 mb-2">
            {/* Left Eye */}
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            {/* Right Eye */}
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
          </div>

          {/* Robot Body */}
          <div className="w-14 h-8 bg-slate-700 rounded-lg border border-white flex items-center justify-center">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
          </div>

          {/* Hover Tooltip */}
          <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
            {isArabic ? "اضغط للتحدث" : "Click to chat"}
          </div>

          {/* Floating Animation */}
          <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-8px); }
            }
            .animate-float {
              animation: float 3s ease-in-out infinite;
            }
          `}</style>
        </div>
      </div>

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


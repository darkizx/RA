import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

export default function WelcomeBot() {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const isArabic = language === "ar";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className={`fixed bottom-4 ${isArabic ? "left-4" : "right-4"} z-40 transition-all duration-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
      {/* Robot Container */}
      <div className="flex flex-col items-center gap-2">
        {/* Speech Bubble */}
        <div className={`bg-white rounded-lg shadow-lg p-4 max-w-xs ${isArabic ? "text-right" : "text-left"}`}>
          <p className="text-sm font-medium text-slate-800">
            {isArabic
              ? "مرحباً! 👋 أنا مساعدك الدراسي الذكي. اختر مادة دراسية لتبدأ!"
              : "Hello! 👋 I'm your smart study assistant. Choose a subject to get started!"}
          </p>
        </div>

        {/* Robot Character */}
        <div className="w-20 h-20 bg-gradient-to-b from-blue-400 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center animate-bounce">
          {/* Robot Head */}
          <div className="relative w-16 h-16">
            {/* Face */}
            <div className="w-full h-full bg-blue-500 rounded-xl flex items-center justify-center relative">
              {/* Left Eye */}
              <div className="absolute top-4 left-3 w-3 h-3 bg-white rounded-full">
                <div className="w-2 h-2 bg-black rounded-full absolute top-0.5 left-0.5"></div>
              </div>

              {/* Right Eye */}
              <div className="absolute top-4 right-3 w-3 h-3 bg-white rounded-full">
                <div className="w-2 h-2 bg-black rounded-full absolute top-0.5 left-0.5"></div>
              </div>

              {/* Mouth */}
              <div className="absolute bottom-3 w-6 h-2 border-b-2 border-black rounded-full"></div>

              {/* Antenna */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-1 h-4 bg-yellow-400 rounded-full">
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-yellow-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Particles */}
        <div className="absolute top-0 left-0 w-20 h-20 pointer-events-none">
          <div className="absolute top-2 left-2 w-1 h-1 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="absolute top-4 right-2 w-1 h-1 bg-blue-300 rounded-full animate-pulse" style={{ animationDelay: "0.2s" }}></div>
          <div className="absolute bottom-2 left-3 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: "0.4s" }}></div>
        </div>
      </div>
    </div>
  );
}


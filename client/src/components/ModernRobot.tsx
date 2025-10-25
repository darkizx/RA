import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface ModernRobotProps {
  subjectColor?: string;
  subjectName?: string;
  greeting?: string;
  isActive?: boolean;
}

export default function ModernRobot({
  subjectColor = "#0277BD",
  subjectName,
  greeting,
  isActive = true,
}: ModernRobotProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const isArabic = language === "ar";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Trigger animation when color changes
  useEffect(() => {
    // This will cause re-render with new color
  }, [subjectColor]);

  return (
    <div
      className={`fixed ${isArabic ? "left-4" : "right-4"} bottom-4 z-40 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {/* Speech Bubble */}
      {greeting && (
        <div
          className={`bg-white rounded-xl shadow-lg p-4 max-w-xs mb-4 ${
            isArabic ? "text-right" : "text-left"
          }`}
        >
          <p className="text-sm font-medium text-slate-800">{greeting}</p>
          {subjectName && (
            <p className="text-xs text-slate-600 mt-1">
              {isArabic ? "اخترت:" : "You selected:"} <strong>{subjectName}</strong>
            </p>
          )}
        </div>
      )}

      {/* Modern Robot Character */}
      <div
        className="w-24 h-28 rounded-2xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500"
        style={{ 
          backgroundColor: subjectColor,
          transition: 'background-color 0.5s ease-in-out, transform 0.3s ease-in-out',
          transform: 'scale(1)'
        }}
        key={subjectColor}
      >
        {/* Robot Head - Visor */}
        <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-20 h-12 bg-slate-800 rounded-xl border-2 border-white flex items-center justify-center">
          {/* Left Eye */}
          <div className="w-4 h-4 bg-cyan-400 rounded-full mr-2 animate-pulse shadow-lg shadow-cyan-400"></div>
          {/* Right Eye */}
          <div className="w-4 h-4 bg-cyan-400 rounded-full ml-2 animate-pulse shadow-lg shadow-cyan-400" style={{ animationDelay: "0.2s" }}></div>
        </div>

        {/* Robot Body */}
        <div className="absolute top-12 w-16 h-12 bg-white rounded-lg border-2 border-slate-800 flex items-center justify-center">
          {/* Center Button */}
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: subjectColor }}
          ></div>
        </div>

        {/* Left Arm */}
        <div className="absolute left-0 top-14 w-3 h-8 bg-slate-800 rounded-full transform -rotate-12"></div>

        {/* Right Arm */}
        <div className="absolute right-0 top-14 w-3 h-8 bg-slate-800 rounded-full transform rotate-12"></div>

        {/* Left Foot */}
        <div className="absolute bottom-2 left-3 w-4 h-3 bg-slate-800 rounded-full"></div>

        {/* Right Foot */}
        <div className="absolute bottom-2 right-3 w-4 h-3 bg-slate-800 rounded-full"></div>

        {/* Antenna */}
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-1 h-5 rounded-full" style={{ backgroundColor: subjectColor }}>
          <div
            className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: subjectColor }}
          ></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-2 left-2 w-1 h-1 rounded-full animate-pulse"
            style={{ 
              backgroundColor: subjectColor, 
              opacity: 0.6,
              transition: 'background-color 0.5s ease-in-out'
            }}
          ></div>
          <div
            className="absolute top-4 right-2 w-1 h-1 rounded-full animate-pulse"
            style={{ 
              backgroundColor: subjectColor, 
              opacity: 0.6, 
              animationDelay: "0.2s",
              transition: 'background-color 0.5s ease-in-out'
            }}
          ></div>
          <div
            className="absolute bottom-3 left-3 w-1 h-1 rounded-full animate-pulse"
            style={{ 
              backgroundColor: subjectColor, 
              opacity: 0.6, 
              animationDelay: "0.4s",
              transition: 'background-color 0.5s ease-in-out'
            }}
          ></div>
        </div>
      </div>

      {/* Bounce Animation */}
      <style>{`
        @keyframes bounce-robot {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-bounce-robot {
          animation: bounce-robot 2s infinite;
        }
      `}</style>
    </div>
  );
}


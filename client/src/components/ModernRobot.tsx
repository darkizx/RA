import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect, useState } from "react";

interface ModernRobotProps {
  subjectColor?: string;
  subjectName?: string;
  greeting?: string;
  isActive?: boolean;
  isInChat?: boolean;
  isPointing?: boolean;
}

export default function ModernRobot({
  subjectColor = "#0277BD",
  subjectName,
  greeting,
  isActive = true,
  isInChat = false,
  isPointing = false,
}: ModernRobotProps) {
  const { language } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const isArabic = language === "ar";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Trigger animation when chat is active
  useEffect(() => {
    if (isInChat) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isInChat]);

  return (
    <div
      className={`flex items-end gap-4 mb-6 transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      } ${isArabic ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* Modern Robot Character - LARGER VERSION */}
      <div
        className={`w-40 h-44 rounded-3xl shadow-2xl flex flex-col items-center justify-center relative overflow-hidden transition-all duration-500 cursor-pointer hover:shadow-3xl flex-shrink-0 ${
          isAnimating ? "animate-bounce" : ""
        }`}
        style={{ 
          backgroundColor: "#E8F4F8",
          border: "4px solid #D0E8F2",
          transition: 'background-color 0.5s ease-in-out, transform 0.3s ease-in-out',
        }}
      >
        {/* Robot Head - Visor */}
        <div className="absolute top-5 left-1/2 transform -translate-x-1/2 w-28 h-20 rounded-2xl border-4 border-slate-800 flex items-center justify-center bg-slate-900 shadow-lg">
          {/* Left Eye */}
          <div className={`w-6 h-6 rounded-full mr-4 shadow-lg transition-all duration-500 ${
            isInChat ? "animate-pulse" : ""
          }`} style={{ 
            backgroundColor: subjectColor || "#0277BD",
            boxShadow: `0 0 12px ${subjectColor || "#0277BD"}`
          }}></div>
          {/* Right Eye */}
          <div className={`w-6 h-6 rounded-full ml-4 shadow-lg transition-all duration-500 ${
            isInChat ? "animate-pulse" : ""
          }`} style={{ 
            backgroundColor: subjectColor || "#0277BD",
            boxShadow: `0 0 12px ${subjectColor || "#0277BD"}`,
            animationDelay: "0.2s"
          }}></div>
        </div>

        {/* Robot Body */}
        <div className="absolute top-28 w-24 h-20 bg-white rounded-lg border-4 border-slate-800 flex items-center justify-center shadow-md">
          {/* Center Button */}
          <div
            className="w-6 h-6 rounded-full transition-all duration-500"
            style={{ 
              backgroundColor: subjectColor || "#0277BD",
              boxShadow: `0 0 10px ${subjectColor || "#0277BD"}`
            }}
          ></div>
        </div>

        {/* Left Arm - Points to speech bubble */}
        <div className={`absolute left-2 top-28 w-4 h-14 bg-slate-800 rounded-full transform transition-all duration-500 origin-top ${
          isPointing || greeting ? "-rotate-45 -translate-x-3 -translate-y-2" : "-rotate-12"
        }`}>
          {/* Pointing finger */}
          {(isPointing || greeting) && (
            <div className="absolute -top-2 -left-1 w-3 h-3 bg-slate-800 rounded-full"></div>
          )}
        </div>

        {/* Right Arm - Waves */}
        <div className={`absolute right-2 top-28 w-4 h-14 bg-slate-800 rounded-full transform transition-transform duration-500 ${
          isAnimating ? "rotate-45 animate-wave" : "rotate-12"
        }`}></div>

        {/* Left Foot */}
        <div className="absolute bottom-4 left-6 w-5 h-4 bg-slate-800 rounded-full"></div>

        {/* Right Foot */}
        <div className="absolute bottom-4 right-6 w-5 h-4 bg-slate-800 rounded-full"></div>

        {/* Antenna */}
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-2 h-8 rounded-full transition-all duration-500" style={{ 
          backgroundColor: subjectColor || "#0277BD",
          boxShadow: `0 0 12px ${subjectColor || "#0277BD"}`
        }}>
          <div
            className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full transition-all duration-500"
            style={{ 
              backgroundColor: subjectColor || "#0277BD",
              boxShadow: `0 0 12px ${subjectColor || "#0277BD"}`
            }}
          ></div>
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ 
              backgroundColor: subjectColor || "#0277BD", 
              opacity: 0.6,
              transition: 'background-color 0.5s ease-in-out'
            }}
          ></div>
          <div
            className="absolute top-6 right-2 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ 
              backgroundColor: subjectColor || "#0277BD", 
              opacity: 0.6, 
              animationDelay: "0.2s",
              transition: 'background-color 0.5s ease-in-out'
            }}
          ></div>
          <div
            className="absolute bottom-4 left-3 w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ 
              backgroundColor: subjectColor || "#0277BD", 
              opacity: 0.6, 
              animationDelay: "0.4s",
              transition: 'background-color 0.5s ease-in-out'
            }}
          ></div>
        </div>
      </div>

      {/* Speech Bubble - Next to Robot */}
      {greeting && (
        <div
          className={`bg-white rounded-xl shadow-lg p-4 max-w-xs mb-4 flex-1 ${
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

      {/* Animations */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          25% { transform: translateY(-15px); }
          50% { transform: translateY(0); }
          75% { transform: translateY(-8px); }
        }
        .animate-bounce {
          animation: bounce 0.8s ease-in-out;
        }

        @keyframes wave {
          0%, 100% { transform: rotate(12deg); }
          25% { transform: rotate(45deg); }
          50% { transform: rotate(12deg); }
          75% { transform: rotate(35deg); }
        }
        .animate-wave {
          animation: wave 0.6s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

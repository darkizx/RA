import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { getSubject } from "@/lib/subjects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { ArrowLeft, Send, Upload, Loader2, Sun, Moon } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import ModernRobot from "@/components/ModernRobot";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function SubjectPage({ params }: { params: { id: string } }) {
  const { language, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [, setLocation] = useLocation();
  const subject = getSubject(params.id);
  const isArabic = language === "ar";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showGreeting, setShowGreeting] = useState(true);
  const [conciseMode, setConciseMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const suggestedFollowUps = isArabic
    ? [
        "اشرح لي هذا المفهوم بطريقة ابسط",
        "اعطني امثلة عملية",
        "ما هي التطبيقات الحقيقية؟",
      ]
    : [
        "Explain this concept in simpler terms",
        "Give me practical examples",
        "What are real-world applications?",
      ];

  // tRPC mutation for AI chat
  const chatMutation = trpc.ai.chat.useMutation({
    onSuccess: (data) => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    },
    onError: (error) => {
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: "assistant",
        content: isArabic
          ? "عذراً، حدث خطأ. يرجى المحاولة مرة أخرى."
          : "Sorry, an error occurred. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    },
  });

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Show greeting on mount
  useEffect(() => {
    const greeting: Message = {
      id: "greeting",
      role: "assistant",
      content: isArabic ? subject?.aiGreetingAr || "" : subject?.aiGreetingEn || "",
      timestamp: new Date(),
    };
    setMessages([greeting]);
  }, [subject, isArabic]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !subject) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setShowGreeting(false);

    // Call the AI API
    chatMutation.mutate({
      subjectId: subject.id,
      message: inputValue,
      language,
      concise: conciseMode,
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      // Handle image upload - we'll implement this in the backend
      console.log("Image selected:", file.name);
      // For now, just add a message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: `[${isArabic ? "صورة" : "Image"}]: ${file.name}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
    }
  };

  if (!subject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <Card className="p-8 text-center">
          <p className="text-slate-600 mb-4">
            {isArabic ? "المادة غير موجودة" : "Subject not found"}
          </p>
          <Button onClick={() => setLocation("/")} variant="default">
            {isArabic ? "العودة للرئيسية" : "Back to Home"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark"
          ? "bg-slate-900"
          : `bg-gradient-to-br ${subject.accentColor}`
      } ${
        isArabic ? "rtl" : "ltr"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className={`${subject.bgColor} ${subject.textColor} shadow-lg`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
                className={`${subject.textColor} hover:opacity-80`}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">
                  {isArabic ? subject.nameAr : subject.nameEn}
                </h1>
                <p className="text-sm opacity-90 mt-1">
                  {isArabic ? subject.descriptionAr : subject.descriptionEn}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => setConciseMode(!conciseMode)}
                className={`font-bold text-xs sm:text-sm px-4 sm:px-6 py-2 rounded-lg transition-all duration-300 ${
                  conciseMode
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                    : "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                }`}
              >
                {conciseMode ? (isArabic ? "✓ مختصر" : "✓ Concise") : (isArabic ? "📖 مفصل" : "📖 Detailed")}
              </Button>
              {toggleTheme && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className={`${subject.textColor} hover:opacity-80`}
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="w-full px-2 sm:px-4 py-4 sm:py-8 h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] flex flex-col bg-gradient-to-b from-transparent">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-4 sm:mb-6 space-y-2 sm:space-y-4 px-1 sm:px-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user"
                  ? isArabic
                    ? "justify-start"
                    : "justify-end"
                  : isArabic
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <Card
                className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base ${
                  message.role === "user"
                    ? `${subject.bgColor} ${subject.textColor}`
                    : theme === "dark"
                    ? "bg-slate-700 text-white"
                    : "bg-white text-slate-800"
                }`}
              >
                <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                <p className="text-[10px] sm:text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString(
                    isArabic ? "ar-SA" : "en-US",
                    { hour: "2-digit", minute: "2-digit" }
                  )}
                </p>
              </Card>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <Card className={`${
                theme === "dark"
                  ? "bg-slate-700 text-white"
                  : "bg-white text-slate-800"
              } px-3 sm:px-4 py-2 sm:py-3`}>
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3 sm:h-4 w-3 sm:w-4 animate-spin" />
                  <p className="text-xs sm:text-sm">
                    {isArabic ? "جاري الكتابة..." : "Typing..."}
                  </p>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Modern Robot with Subject Color - Above Input */}
        <ModernRobot
          subjectColor={subject.color}
          subjectName={isArabic ? subject.nameAr : subject.nameEn}
          greeting={
            showGreeting
              ? isArabic
                ? `أهلاً وسهلاً في ${subject.nameAr}! 👋`
                : `Welcome to ${subject.nameEn}! 👋`
              : undefined
          }
          isActive={true}
          isInChat={chatMutation.isPending}
        />

        {/* Suggested Follow-ups */}
        {messages.length > 0 && (
          <div className="mb-4 space-y-3">
            <p className={`text-sm sm:text-base font-bold ${
              theme === "dark" ? "text-white" : "text-slate-800"
            }`}>
              {isArabic ? "اقتراحات متابعة:" : "Suggested follow-ups:"}
            </p>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {suggestedFollowUps.map((suggestion) => (
                <Button
                  key={suggestion}
                  onClick={() => setInputValue(suggestion)}
                  className="bg-white text-slate-800 border-2 border-white hover:bg-slate-100 font-semibold text-xs sm:text-sm px-3 sm:px-6 py-2 sm:py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className={`${
          theme === "dark" ? "bg-slate-800" : "bg-white"
        } rounded-lg shadow-lg p-3 sm:p-4 sticky bottom-0`}>
          <div className="flex gap-2 items-center">
            <Input
              type="text"
              placeholder={
                isArabic
                  ? "اسأل سؤالاً أو اطلب مساعدة..."
                  : "Ask a question or request help..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !chatMutation.isPending) {
                  handleSendMessage();
                }
              }}
              disabled={chatMutation.isPending}
              className="flex-1 text-sm sm:text-base h-10 sm:h-auto"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={chatMutation.isPending}
              className="h-10 w-10 sm:h-auto sm:w-auto flex-shrink-0"
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || chatMutation.isPending}
              className={`${subject.bgColor} ${subject.textColor} hover:opacity-90 h-10 w-10 sm:h-auto sm:w-auto flex-shrink-0 p-2 sm:p-0`}
            >
              {chatMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </main>


    </div>
  );
}


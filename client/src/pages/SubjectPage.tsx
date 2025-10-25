import { useLanguage } from "@/contexts/LanguageContext";
import { getSubject } from "@/lib/subjects";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { ArrowLeft, Send, Upload, Loader2 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function SubjectPage({ params }: { params: { id: string } }) {
  const { language, t } = useLanguage();
  const [, setLocation] = useLocation();
  const subject = getSubject(params.id);
  const isArabic = language === "ar";

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [showGreeting, setShowGreeting] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      className={`min-h-screen bg-gradient-to-br ${subject.accentColor} ${
        isArabic ? "rtl" : "ltr"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Header */}
      <header className={`${subject.bgColor} ${subject.textColor} shadow-lg`}>
        <div className="container mx-auto px-4 py-6">
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
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span>{subject.icon}</span>
                {isArabic ? subject.nameAr : subject.nameEn}
              </h1>
              <p className="text-sm opacity-90 mt-1">
                {isArabic ? subject.descriptionAr : subject.descriptionEn}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="container mx-auto px-4 py-8 h-[calc(100vh-200px)] flex flex-col">
        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto mb-6 space-y-4">
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
                className={`max-w-xs lg:max-w-md px-4 py-3 ${
                  message.role === "user"
                    ? `${subject.bgColor} ${subject.textColor}`
                    : "bg-white text-slate-800"
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
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
              <Card className="bg-white text-slate-800 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p className="text-sm">
                    {isArabic ? "جاري الكتابة..." : "Typing..."}
                  </p>
                </div>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="bg-white rounded-lg shadow-lg p-4">
          <div className="flex gap-2">
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
              className="flex-1"
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
            >
              <Upload className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || chatMutation.isPending}
              className={`${subject.bgColor} ${subject.textColor} hover:opacity-90`}
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


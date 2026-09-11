import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Send, Bot, User, RefreshCw } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

interface CampusAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampusAIModal: React.FC<CampusAIModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      sender: "ai",
      text: "👋 Hi! I'm your CampusHub AI Assistant. Ask me anything about course prep, hostel locations, marketplace deals, or campus navigation!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const userQuery = input.trim();
    setInput("");
    setLoading(true);

    // AI smart response simulation tailored for campus
    setTimeout(() => {
      let aiText = "I'm looking into your campus request! Check the Academic tab for past questions or Hostel Hub for housing updates.";

      const q = userQuery.toLowerCase();
      if (q.includes("hostel") || q.includes("room") || q.includes("accommodation")) {
        aiText = "🏠 For hostel listings, open the Hostel Hub tab in CampusHub! You can filter by price, distance to lecture halls, and find compatible roommates.";
      } else if (q.includes("exam") || q.includes("past question") || q.includes("grade") || q.includes("gpa")) {
        aiText = "📚 For exam prep and GPA calculations, open the Academic Hub in the side menu! We have past questions and course note repositories.";
      } else if (q.includes("buy") || q.includes("sell") || q.includes("price") || q.includes("phone")) {
        aiText = "🛍️ Check the Campus Marketplace tab to buy & sell verified gadgets, textbooks, and fashion items directly with fellow students.";
      } else if (q.includes("hi") || q.includes("hello") || q.includes("hey")) {
        aiText = "Hello! How can I assist your campus life today? You can ask about hostels, marketplace items, exam materials, or campus news.";
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "ai",
        text: aiText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setLoading(false);
    }, 800);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md">
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          className="w-full max-w-md h-[85vh] bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden pb-safe"
        >
          {/* Header */}
          <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 shadow-md">
                <Sparkles className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm flex items-center gap-1.5">
                  Campus AI Assistant
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h3>
                <p className="text-[11px] text-slate-400">Always online to help you study & thrive</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  msg.sender === "user" ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === "user"
                      ? "bg-slate-700 text-slate-200"
                      : "bg-yellow-400 text-slate-950"
                  }`}
                >
                  {msg.sender === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === "user"
                        ? "bg-yellow-400 text-slate-950 rounded-tr-none font-medium"
                        : "bg-slate-800/90 text-slate-100 border border-slate-700/60 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block text-right px-1">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs p-2">
                <RefreshCw className="w-4 h-4 animate-spin text-yellow-400" />
                Campus AI is thinking...
              </div>
            )}
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask Campus AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-2xl bg-yellow-400 text-slate-950 font-bold flex items-center justify-center disabled:opacity-40"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

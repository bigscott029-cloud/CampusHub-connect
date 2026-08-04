import { useState } from "react";
import { Bot, Send, Sparkles, X, DollarSign, School, ShieldCheck, Megaphone, Hash, Users, BookOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const suggestedPrompts = [
  "How can I earn money on CampusHub?",
  "How do I verify as an Agent/Trader?",
  "How do trending hashtags work?",
  "How to calculate GPA & join Study Groups?",
];

const localAssistantReply = (prompt: string) => {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("earn") || normalized.includes("monetiz") || normalized.includes("creator") || normalized.includes("revenue") || normalized.includes("twitter") || normalized.includes("x")) {
    return "💡 **Creator Monetization & Earnings on CampusHub**:\n• You earn **XP & Popularity Points** by posting gists, receiving likes, and getting engagement.\n• When you hit **Popular / Influencer Status (1,000+ XP)**, you unlock the **Creator Revenue Share Pool**.\n• Plus, earn **₦500 per active referral** who signs up using your unique link!\n• Check your earnings & cash out under **Profile -> Reputation & Creator Revenue**.";
  }

  if (normalized.includes("agent") || normalized.includes("trader") || normalized.includes("verify") || normalized.includes("20k") || normalized.includes("flutterwave")) {
    return "🛡️ **Agent & Vendor Verification**:\n• Verification fee is **₦20,000** (processed via fixed Flutterwave link or manual WhatsApp fallback).\n• Benefits: Verified badge, unlimited property/item listings, priority search placement, and client trust score.\n• Go to **Admin / Profile -> Request Verification** to start.";
  }

  if (normalized.includes("hashtag") || normalized.includes("trend") || normalized.includes("topic")) {
    return "🔥 **Trending Hashtags**:\n• Click any hashtag like `#UNILAG`, `#FUTA`, or `#CampusMarket` anywhere in the app to view all posts on that trending topic.\n• Trending topics update in real-time based on engagement across your university and state region.";
  }

  if (normalized.includes("gpa") || normalized.includes("study") || normalized.includes("exam") || normalized.includes("group")) {
    return "📚 **Academic Tools & Study Groups**:\n• **GPA Calculator:** Enter course units and grades under **Academic -> GPA Calculator**.\n• **Study Groups:** Create or join student study groups with WhatsApp chat links under **Academic -> Study Groups**.\n• **Exam Timetable:** Set countdown alerts for upcoming tests.";
  }

  if (normalized.includes("hostel") || normalized.includes("roommate") || normalized.includes("room")) {
    return "🏠 **Hostel & Roommate Hub**:\n• Browse verified student accommodations or post a roommate search request under **Hostels**.\n• Service fees are kept transparent, and payments are protected.";
  }

  if (normalized.includes("ad") || normalized.includes("sponsor") || normalized.includes("boost") || normalized.includes("banner")) {
    return "📢 **Ads & Sponsored Boosts**:\n• Request ad campaigns across **Popup**, **Marketplace Header**, **Hostel Banner**, or **Inline Feed**.\n• Fee is **₦5,000** for targeted campus ad placements. Managed via **Admin -> Ads**.";
  }

  if (normalized.includes("anonymous")) {
    return "👻 **Anonymous Zone**:\n• Share campus confessions or ask sensitive questions completely anonymously without revealing your identity!";
  }

  return "👋 I'm Campus AI, your assistant! Ask me about **Creator Earnings**, **Agent Verification (₦20,000)**, **Hostel Listings**, **Trending Hashtags**, **GPA Calculator**, or **Sponsored Ads**.";
};

const CampusAIButton = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "👋 Hi, I am Campus AI! I can help you with Creator Earnings, Hostel Listings, Agent Verification, Trending Topics, and Academic Tools.",
    },
  ]);

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || input).trim();
    if (!prompt) return;

    if (!textToSend) setInput("");
    setMessages((current) => [...current, { role: "user", content: prompt }]);
    setLoading(true);

    try {
      const endpoint = import.meta.env.VITE_AI_ASSISTANT_ENDPOINT as string | undefined;
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: prompt }),
        });
        const data = await response.json();
        setMessages((current) => [...current, { role: "assistant", content: data.reply || localAssistantReply(prompt) }]);
      } else {
        setMessages((current) => [...current, { role: "assistant", content: localAssistantReply(prompt) }]);
      }
    } catch {
      setMessages((current) => [...current, { role: "assistant", content: localAssistantReply(prompt) }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <Card className="fixed bottom-20 right-4 z-50 flex h-[min(600px,80vh)] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden shadow-2xl border-primary/20">
          <CardHeader className="flex-row items-center justify-between border-b bg-muted/40 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold text-sm">Campus AI Assistant</p>
                <p className="text-xs text-muted-foreground">Smart handler & platform guide</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="flex min-h-0 flex-1 flex-col gap-3 p-3">
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3">
                {messages.map((message, index) => (
                  <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border/50"}`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-muted px-3.5 py-2 rounded-2xl text-xs text-muted-foreground animate-pulse">
                      Campus AI is typing...
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Quick Suggestion Pills */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {suggestedPrompts.map((promptText) => (
                <Badge
                  key={promptText}
                  variant="outline"
                  className="cursor-pointer text-[11px] hover:bg-primary/10 hover:border-primary/30 transition-colors py-1"
                  onClick={() => handleSend(promptText)}
                >
                  {promptText}
                </Badge>
              ))}
            </div>

            <div className="flex gap-2 pt-1 border-t">
              <Input
                placeholder="Ask Campus AI..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleSend()}
              />
              <Button size="icon" onClick={() => handleSend()} disabled={!input.trim() || loading} variant="hero">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Button className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-xl hover:scale-105 transition-transform" size="icon" variant="hero" onClick={() => setOpen((current) => !current)}>
        <Bot className="h-7 w-7" />
      </Button>
    </>
  );
};

export default CampusAIButton;

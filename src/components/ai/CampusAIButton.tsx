import { useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const localAssistantReply = (prompt: string) => {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("hostel") || normalized.includes("room")) {
    return "I can help you compare hostel listings, check verification status, and message agents. For safety, use verified listings and keep payment inside CampusHub where required.";
  }

  if (normalized.includes("market") || normalized.includes("sell") || normalized.includes("buy")) {
    return "For marketplace posts, choose your listing model, upload clear photos, and wait for admin approval. Sponsored ads can improve visibility if you want faster reach.";
  }

  if (normalized.includes("anonymous")) {
    return "Anonymous Zone lets you read posts freely, but posting or replying requires an anonymous identity so moderation remains consistent.";
  }

  if (normalized.includes("verify")) {
    return "Open Profile, add your academic details, then upload or capture a student document. Admin will review and approve student verification.";
  }

  return "Ask me about hostels, marketplace, verification, messages, ads, or campus discovery. Full AI responses can be connected through the CampusHub AI backend endpoint.";
};

const CampusAIButton = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Hi, I am Campus AI. I can help you find your way around CampusHub.",
    },
  ]);

  const sendMessage = async () => {
    const prompt = input.trim();
    if (!prompt) return;

    setInput("");
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
        <Card className="fixed bottom-20 right-4 z-50 flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-2rem))] flex-col overflow-hidden shadow-xl">
          <CardHeader className="flex-row items-center justify-between border-b py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-semibold">Campus AI</p>
                <p className="text-xs text-muted-foreground">Smart campus handler</p>
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
                    <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                {loading && <p className="text-xs text-muted-foreground">Thinking...</p>}
              </div>
            </ScrollArea>
            <div className="flex gap-2">
              <Input
                placeholder="Ask Campus AI..."
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && sendMessage()}
              />
              <Button size="icon" onClick={sendMessage} disabled={!input.trim() || loading}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      <Button className="fixed bottom-4 right-4 z-50 h-14 w-14 rounded-full shadow-lg" size="icon" onClick={() => setOpen((current) => !current)}>
        <Bot className="h-6 w-6" />
      </Button>
    </>
  );
};

export default CampusAIButton;

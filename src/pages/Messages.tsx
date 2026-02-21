import { useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Search,
  Send,
  MoreVertical,
  Phone,
  Video,
  Image as ImageIcon,
  Smile,
  Users,
  Plus,
  Upload,
  Link2,
} from "lucide-react";
import StoriesCarousel from "@/components/messages/StoriesCarousel";
import { toast } from "sonner";
import EmojiPicker from "emoji-picker-react";
import { useEffect } from "react";

interface Conversation {
  id: number;
  name: string;
  type: "group" | "dm";
  lastMessage: string;
  time: string;
  unread: number;
  members?: number;
  online?: boolean;
}

interface Message {
  id: number;
  sender: string;
  content: string;
  time: string;
  isMine: boolean;
  image?: string;
}

const initialConversations: Conversation[] = [
  { id: 1, name: "Study Group - CSC 301", type: "group", lastMessage: "See you all at the library at 3pm!", time: "2 mins ago", unread: 3, members: 12 },
  { id: 2, name: "Jane Doe", type: "dm", lastMessage: "Thanks for the notes!", time: "15 mins ago", unread: 0, online: true },
  { id: 3, name: "Hostel Block A", type: "group", lastMessage: "Anyone has a spare charger?", time: "1 hour ago", unread: 5, members: 45 },
  { id: 4, name: "Mike Johnson", type: "dm", lastMessage: "Is the laptop still available?", time: "3 hours ago", unread: 1, online: false },
];

const initialMessages: Message[] = [
  { id: 1, sender: "Jane Doe", content: "Hey! Did you get the assignment details?", time: "2:30 PM", isMine: false },
  { id: 2, sender: "You", content: "Yes! It's due next Friday", time: "2:31 PM", isMine: true },
  { id: 3, sender: "Jane Doe", content: "Great, can you share the requirements?", time: "2:32 PM", isMine: false },
  { id: 4, sender: "You", content: "Sure, I'll send them over now", time: "2:33 PM", isMine: true },
  { id: 5, sender: "Jane Doe", content: "Thanks for the notes! 📚", time: "2:35 PM", isMine: false },
];

const Messages = () => {
  const [searchParams] = useSearchParams();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const to = searchParams.get("to");
    const message = searchParams.get("message");
    if (to) {
      const existingConv = conversations.find(c => c.name === to);
      if (existingConv) {
        setSelectedChat(existingConv.id);
      } else {
        const newConv: Conversation = { id: Date.now(), name: to, type: "dm", lastMessage: "", time: "Now", unread: 0, online: false };
        setConversations([newConv, ...conversations]);
        setSelectedChat(newConv.id);
      }
      if (message) setNewMessage(message);
    }
  }, [searchParams]);

  const selectedConversation = conversations.find((c) => c.id === selectedChat);

  const handleSelectChat = (chatId: number) => {
    setSelectedChat(chatId);
    setConversations(conversations.map(conv => conv.id === chatId ? { ...conv, unread: 0 } : conv));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChat) return;
    const newMsg: Message = { id: Date.now(), sender: "You", content: newMessage.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMine: true };
    setMessages([...messages, newMsg]);
    setConversations(conversations.map(conv => conv.id === selectedChat ? { ...conv, lastMessage: newMessage.trim(), time: "Just now" } : conv));
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handleEmojiSelect = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setEmojiOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedChat) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const msg: Message = { id: Date.now(), sender: "You", content: "📷 Image", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), isMine: true, image: ev.target?.result as string };
        setMessages(prev => [...prev, msg]);
      };
      reader.readAsDataURL(file);
    });
    setAttachOpen(false);
  };

  const handleCall = () => {
    if (selectedConversation) toast.info(`Calling ${selectedConversation.name}...`);
  };
  const handleVideoCall = () => {
    if (selectedConversation) toast.info(`Video calling ${selectedConversation.name}...`);
  };

  // Search messages
  const filteredMessages = searchQuery && selectedChat
    ? messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  const filteredConversations = conversations.filter(conv => conv.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Conversations List */}
      <Card className="glass-card w-80 shrink-0 flex flex-col">
        <StoriesCarousel />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Messages</h2>
            <Button variant="ghost" size="icon"><Plus className="w-4 h-4" /></Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="px-2">
            {filteredConversations.map((conv) => (
              <button key={conv.id} onClick={() => handleSelectChat(conv.id)} className={`w-full p-3 rounded-lg flex items-center gap-3 hover:bg-muted/50 transition-colors ${selectedChat === conv.id ? "bg-muted" : ""}`}>
                <div className="relative">
                  <Avatar><AvatarFallback className={conv.type === "group" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"}>{conv.type === "group" ? <Users className="w-4 h-4" /> : conv.name.charAt(0)}</AvatarFallback></Avatar>
                  {conv.online && <div className="absolute bottom-0 right-0 w-3 h-3 bg-success rounded-full border-2 border-background" />}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between"><p className="font-medium text-sm truncate">{conv.name}</p><span className="text-xs text-muted-foreground">{conv.time}</span></div>
                  <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                </div>
                {conv.unread > 0 && <Badge className="bg-primary text-primary-foreground h-5 w-5 p-0 flex items-center justify-center text-xs">{conv.unread}</Badge>}
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      {/* Chat Area */}
      <Card className="glass-card flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b border-border/50 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary">{selectedConversation.type === "group" ? <Users className="w-4 h-4" /> : selectedConversation.name.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-semibold">{selectedConversation.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedConversation.type === "group" ? `${selectedConversation.members} members` : selectedConversation.online ? "Online" : "Offline"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={handleCall}><Phone className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={handleVideoCall}><Video className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {filteredMessages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.isMine ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${msg.isMine ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted rounded-bl-md"}`}>
                      {msg.image && <img src={msg.image} alt="Shared" className="rounded-lg mb-2 max-w-full" />}
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${msg.isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{msg.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border/50">
              <div className="flex items-center gap-2">
                <input ref={imageInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleImageUpload} />
                <Dialog open={attachOpen} onOpenChange={setAttachOpen}>
                  <Button variant="ghost" size="icon" onClick={() => setAttachOpen(true)}><ImageIcon className="w-5 h-5" /></Button>
                  {attachOpen && (
                    <DialogContent>
                      <DialogHeader><DialogTitle>Add Media</DialogTitle></DialogHeader>
                      <Tabs defaultValue="device">
                        <TabsList className="w-full"><TabsTrigger value="device" className="flex-1"><Upload className="w-4 h-4 mr-1" />From Device</TabsTrigger><TabsTrigger value="url" className="flex-1"><Link2 className="w-4 h-4 mr-1" />URL</TabsTrigger></TabsList>
                        <TabsContent value="device" className="py-4"><Button variant="outline" className="w-full" onClick={() => { imageInputRef.current?.click(); setAttachOpen(false); }}><Upload className="w-4 h-4 mr-2" />Choose Files</Button></TabsContent>
                        <TabsContent value="url" className="py-4 space-y-2">
                          <Input placeholder="Paste URL..." onKeyDown={(e) => { if (e.key === "Enter") { const v = (e.target as HTMLInputElement).value; if (v.trim()) { setNewMessage(prev => prev + " " + v.trim()); setAttachOpen(false); } } }} />
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  )}
                </Dialog>
                <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleKeyPress} className="flex-1" />
                <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                  <PopoverTrigger asChild><Button variant="ghost" size="icon"><Smile className="w-5 h-5" /></Button></PopoverTrigger>
                  <PopoverContent className="w-auto p-0" side="top"><EmojiPicker onEmojiClick={handleEmojiSelect} /></PopoverContent>
                </Popover>
                <Button variant="hero" size="icon" disabled={!newMessage.trim()} onClick={handleSendMessage}><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center"><MessageCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" /><p className="text-muted-foreground">Select a conversation to start messaging</p></div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Messages;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import EmojiPicker from "emoji-picker-react";
import {
  MessageCircle,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Send,
  Smile,
  UserPlus,
  Users,
  Video,
  Radio,
  Share2,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Circle,
  ExternalLink,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

import StoriesCarousel from "@/components/messages/StoriesCarousel";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/lib/utils";

interface ConversationView {
  id: string;
  otherUserId: string;
  name: string;
  handle: string;
  userType?: string;
  lastMessage: string;
  time: string;
  unread: number;
  isOnline?: boolean;
}

interface MessageView {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  expires_at?: string | null;
  view_once?: boolean | null;
  viewed_at?: string | null;
}

interface PeopleSearchResult {
  user_id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  user_type?: string | null;
  friendship_status: string | null;
  friendship_id: string | null;
}

const telegramCampusChannels = [
  { id: "chan-1", name: "🔥 UNILAG Gists & Gossip", handle: "@unilag_gists", subscribers: "4.2k members", category: "Gists", link: "https://t.me/unilaggists" },
  { id: "chan-2", name: "🏠 Campus Hostel Alerts", handle: "@hostel_connect", subscribers: "3.1k members", category: "Housing", link: "https://t.me/campushostels" },
  { id: "chan-3", name: "🛍️ Marketplace Flash Deals", handle: "@campus_deals", subscribers: "5.8k members", category: "Market", link: "https://t.me/campusdeals" },
  { id: "chan-4", name: "📚 Academic Circles & Exams", handle: "@academic_hub", subscribers: "2.7k members", category: "Study", link: "https://t.me/academic_circles" },
];

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const Messages = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"chats" | "channels" | "directory">("chats");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [disappearingEnabled, setDisappearingEnabled] = useState(false);
  const [viewOnce, setViewOnce] = useState(false);
  const [chatStyle, setChatStyle] = useState<"telegram" | "whatsapp" | "snapchat">("telegram");
  const [friendDialogOpen, setFriendDialogOpen] = useState(false);
  const [friendSearch, setFriendSearch] = useState("");

  const currentProfileQuery = useQuery({
    queryKey: ["message-profile", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("profiles")
        .select("display_name, username, referral_code, user_type")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const peopleSearchQuery = useQuery({
    queryKey: ["people-search", user?.id, friendSearch],
    enabled: Boolean(user) && (friendDialogOpen || activeTab === "directory"),
    queryFn: async (): Promise<PeopleSearchResult[]> => {
      const { data, error } = await (supabase as any).rpc("search_people", {
        search_term: friendSearch.trim() || searchQuery.trim(),
      });

      if (error) throw error;
      return data ?? [];
    },
  });

  const conversationsQuery = useQuery({
    queryKey: ["conversations", user?.id],
    enabled: Boolean(user),
    queryFn: async (): Promise<ConversationView[]> => {
      const { data: conversations, error } = await supabase
        .from("conversations")
        .select("id, participant_1, participant_2, last_message_at, created_at")
        .order("last_message_at", { ascending: false });

      if (error) throw error;

      const otherUserIds = (conversations ?? []).map((conversation) =>
        conversation.participant_1 === user?.id ? conversation.participant_2 : conversation.participant_1,
      );
      const conversationIds = (conversations ?? []).map((conversation) => conversation.id);

      const [{ data: profiles }, { data: latestMessages }] = await Promise.all([
        otherUserIds.length
          ? (supabase as any).from("profiles").select("user_id, display_name, username, user_type").in("user_id", otherUserIds)
          : Promise.resolve({ data: [] }),
        conversationIds.length
          ? supabase
              .from("messages")
              .select("conversation_id, content, created_at")
              .in("conversation_id", conversationIds)
              .order("created_at", { ascending: false })
          : Promise.resolve({ data: [] }),
      ]);

      const profileMap = new Map((profiles ?? []).map((profile: any) => [profile.user_id, profile]));
      const latestMap = new Map<string, any>();
      (latestMessages ?? []).forEach((message: any) => {
        if (!latestMap.has(message.conversation_id)) latestMap.set(message.conversation_id, message);
      });

      return (conversations ?? []).map((conversation) => {
        const otherUserId = conversation.participant_1 === user?.id ? conversation.participant_2 : conversation.participant_1;
        const profile = profileMap.get(otherUserId);
        const latest = latestMap.get(conversation.id);
        const name = profile?.display_name || "Campus Member";

        return {
          id: conversation.id,
          otherUserId,
          name,
          handle: `@${profile?.username || name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 15)}`,
          userType: profile?.user_type || "student",
          lastMessage: latest?.content || "Tap to start conversation",
          time: latest?.created_at ? formatRelativeTime(latest.created_at) : "New",
          unread: 0,
          isOnline: true,
        };
      });
    },
  });

  const messagesQuery = useQuery({
    queryKey: ["messages", selectedChat],
    enabled: Boolean(selectedChat),
    queryFn: async (): Promise<MessageView[]> => {
      const { data, error } = await supabase
        .from("messages")
        .select("id, sender_id, content, created_at, expires_at, view_once, viewed_at")
        .eq("conversation_id", selectedChat)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("realtime-messages")
      .on("postgres_changes", { event: "*", schema: "public", table: "messages" }, () => {
        queryClient.invalidateQueries({ queryKey: ["messages"] });
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "conversations" }, () => {
        queryClient.invalidateQueries({ queryKey: ["conversations"] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const startConversationMutation = useMutation({
    mutationFn: async ({ target, prefill }: { target: string; prefill?: string | null }) => {
      if (!user) throw new Error("Please sign in to send messages.");

      let targetUserId = target;
      if (!uuidPattern.test(target)) {
        const { data: profile } = await (supabase as any)
          .from("profiles")
          .select("user_id")
          .ilike("display_name", target)
          .maybeSingle();
        targetUserId = profile?.user_id;
      }

      if (!targetUserId || targetUserId === user.id) throw new Error("Could not find that campus member.");

      const existing = (conversationsQuery.data ?? []).find((conversation) => conversation.otherUserId === targetUserId);
      if (existing) {
        setSelectedChat(existing.id);
        if (prefill) setNewMessage(prefill);
        return existing.id;
      }

      const { data, error } = await supabase
        .from("conversations")
        .insert({ participant_1: user.id, participant_2: targetUserId })
        .select("id")
        .single();

      if (error) throw error;

      setSelectedChat(data.id);
      if (prefill) setNewMessage(prefill);
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
      return data.id;
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    const to = searchParams.get("to");
    const message = searchParams.get("message");
    if (to && user && !startConversationMutation.isPending) {
      startConversationMutation.mutate({ target: to, prefill: message });
    }
  }, [searchParams, user]);

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!user || !selectedChat || !newMessage.trim()) return;

      const { error } = await supabase.from("messages").insert({
        conversation_id: selectedChat,
        sender_id: user.id,
        content: newMessage.trim(),
        expires_at: disappearingEnabled ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : null,
        view_once: viewOnce,
      });

      if (error) throw error;

      await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", selectedChat);
    },
    onSuccess: () => {
      setNewMessage("");
      setViewOnce(false);
      queryClient.invalidateQueries({ queryKey: ["messages", selectedChat] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const conversations = useMemo(() => conversationsQuery.data ?? [], [conversationsQuery.data]);
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedChat);
  const filteredConversations = useMemo(
    () => conversations.filter((conversation) => conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) || conversation.handle.toLowerCase().includes(searchQuery.toLowerCase())),
    [conversations, searchQuery],
  );

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessageMutation.mutate();
    }
  };

  return (
    <div className="flex h-[calc(100vh-7.5rem)] gap-4">
      {/* LEFT SIDEBAR: STYLISH TELEGRAM+WHATSAPP HYBRID MESSAGING HUB */}
      <Card className="glass-card flex w-80 md:w-96 shrink-0 flex-col overflow-hidden border-primary/20">
        {/* Campus Status / Stories Carousel Header */}
        <StoriesCarousel />

        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg flex items-center gap-1.5">
                <MessageCircle className="w-5 h-5 text-primary" /> CampusHub DM
              </h2>
              <p className="text-xs text-muted-foreground">Telegram + WhatsApp Campus Space</p>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setFriendDialogOpen(true)} title="Add Friend / Search Handle">
                <UserPlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search @username, chats, or channels..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10 text-xs bg-card"
            />
          </div>

          {/* MODE TABS (CHATS / CHANNELS / DIRECTORY) */}
          <div className="pt-2">
            <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
              <TabsList className="w-full grid grid-cols-3 bg-muted/60 p-1">
                <TabsTrigger value="chats" className="text-xs font-semibold">Chats</TabsTrigger>
                <TabsTrigger value="channels" className="text-xs font-semibold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-sky-500" /> Channels
                </TabsTrigger>
                <TabsTrigger value="directory" className="text-xs font-semibold">Directory</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        {/* LEFT TAB CONTENTS */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {/* CHATS TAB */}
            {activeTab === "chats" && (
              filteredConversations.length === 0 ? (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  <p>No active conversations yet.</p>
                  <Button size="sm" variant="outline" className="mt-2" onClick={() => setFriendDialogOpen(true)}>
                    <UserPlus className="w-4 h-4 mr-1" /> Find Campus Members
                  </Button>
                </div>
              ) : (
                filteredConversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedChat(conversation.id)}
                    className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all hover:bg-muted/70 ${selectedChat === conversation.id ? "bg-primary/10 border border-primary/30" : ""}`}
                  >
                    <div className="relative">
                      <Avatar className="h-11 w-11 border border-border">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{conversation.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-semibold">{conversation.name}</p>
                        <span className="text-[11px] text-muted-foreground">{conversation.time}</span>
                      </div>
                      <div className="flex items-center justify-between mt-0.5">
                        <p className="truncate text-xs text-muted-foreground max-w-[160px]">{conversation.lastMessage}</p>
                        <Badge variant="outline" className="text-[10px] py-0 px-1.5 uppercase font-mono">
                          {conversation.userType === "agent_trader" ? "Vendor" : "Student"}
                        </Badge>
                      </div>
                    </div>
                  </button>
                ))
              )
            )}

            {/* TELEGRAM CHANNELS TAB */}
            {activeTab === "channels" && (
              <div className="space-y-3 p-1">
                <div className="p-2.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-xs text-sky-700 dark:text-sky-300">
                  <p className="font-semibold flex items-center gap-1"><Radio className="w-3.5 h-3.5" /> Broadcast Channels</p>
                  <p className="mt-0.5">Join official campus hubs for fast announcements and deals.</p>
                </div>
                {telegramCampusChannels.map((channel) => (
                  <div key={channel.id} className="p-3 rounded-xl border border-border/60 bg-card space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold text-sm">{channel.name}</p>
                        <p className="text-xs text-muted-foreground">{channel.handle} • {channel.subscribers}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{channel.category}</Badge>
                    </div>
                    <Button asChild size="sm" variant="outline" className="w-full text-xs gap-1 text-sky-600 dark:text-sky-400">
                      <a href={channel.link} target="_blank" rel="noreferrer">
                        <ExternalLink className="w-3.5 h-3.5" /> Open Telegram Channel
                      </a>
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* DIRECTORY TAB */}
            {activeTab === "directory" && (
              <div className="space-y-2 p-1">
                <p className="text-xs text-muted-foreground px-2 font-medium">Platform Campus Members</p>
                {(peopleSearchQuery.data ?? []).map((person) => (
                  <div key={person.user_id} className="p-2.5 rounded-xl border border-border/60 bg-card flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-xs text-primary">{person.display_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold truncate">{person.display_name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">@{person.username || "student"}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="hero"
                      className="text-xs shrink-0 h-8 px-3"
                      onClick={() => {
                        startConversationMutation.mutate({ target: person.user_id });
                        setActiveTab("chats");
                      }}
                    >
                      Chat
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </Card>

      {/* RIGHT CHAT WINDOW */}
      <Card className="glass-card flex flex-1 flex-col overflow-hidden border-primary/20">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <CardHeader className="border-b border-border/50 py-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10 border border-primary/30">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{selectedConversation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold text-sm">{selectedConversation.name}</p>
                      <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                        {selectedConversation.handle}
                      </Badge>
                    </div>
                    <p className="text-xs text-emerald-500 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active on CampusHub
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {(["telegram", "whatsapp", "snapchat"] as const).map((style) => (
                    <Button key={style} variant={chatStyle === style ? "default" : "ghost"} size="sm" className="h-7 text-xs capitalize" onClick={() => setChatStyle(style)}>
                      {style}
                    </Button>
                  ))}
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info(`Calling ${selectedConversation.name}...`)}><Phone className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toast.info(`Video calling ${selectedConversation.name}...`)}><Video className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>

            {/* Messages Stream */}
            <ScrollArea className="flex-1 p-4 bg-muted/10">
              <div className="space-y-3">
                {(messagesQuery.data ?? []).map((message) => {
                  const isMine = message.sender_id === user?.id;
                  const themeStyle =
                    chatStyle === "telegram"
                      ? isMine ? "bg-sky-600 text-white" : "bg-card border border-border/60"
                      : chatStyle === "whatsapp"
                      ? isMine ? "bg-emerald-600 text-white" : "bg-card border border-border/60"
                      : isMine ? "bg-accent text-accent-foreground" : "bg-muted";

                  return (
                    <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[75%] sm:max-w-[65%] rounded-2xl px-4 py-2.5 shadow-sm ${isMine ? `rounded-br-none ${themeStyle}` : `rounded-bl-none ${themeStyle}`}`}>
                        <p className="text-xs sm:text-sm leading-relaxed">{message.content}</p>
                        <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMine ? "text-white/80" : "text-muted-foreground"}`}>
                          <span>{formatRelativeTime(message.created_at)}</span>
                          {isMine && <CheckCheck className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Message Input Box */}
            <div className="border-t border-border/50 p-3 bg-card">
              <div className="mb-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <Label className="flex items-center gap-1.5 cursor-pointer">
                  <Switch checked={disappearingEnabled} onCheckedChange={setDisappearingEnabled} />
                  24h Disappearing
                </Label>
                <Label className="flex items-center gap-1.5 cursor-pointer">
                  <Switch checked={viewOnce} onCheckedChange={setViewOnce} />
                  View Once
                </Label>
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder={`Message ${selectedConversation.name}...`}
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1 text-xs sm:text-sm"
                />
                <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9"><Smile className="h-5 w-5" /></Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" side="top">
                    <EmojiPicker onEmojiClick={(emojiData) => { setNewMessage((curr) => curr + emojiData.emoji); setEmojiOpen(false); }} />
                  </PopoverContent>
                </Popover>

                <Button
                  variant="hero"
                  size="icon"
                  className="h-9 w-9 shrink-0"
                  disabled={!newMessage.trim() || sendMessageMutation.isPending}
                  onClick={() => sendMessageMutation.mutate()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-display font-bold">Select a Chat or Search Username</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              Connect with fellow students, agents, and vendors. Search handles using `@username` or choose a contact on the left.
            </p>
          </div>
        )}
      </Card>

      {/* Friend Search Dialog */}
      <Dialog open={friendDialogOpen} onOpenChange={setFriendDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Find & Add Campus Contacts</DialogTitle>
            <DialogDescription>Search registered members by handle, display name, or phone number.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search @username or name..."
                value={friendSearch}
                onChange={(event) => setFriendSearch(event.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2">
              {(peopleSearchQuery.data ?? []).map((person) => (
                <div key={person.user_id} className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary font-bold">{person.display_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold">{person.display_name}</p>
                      <p className="text-[11px] text-muted-foreground">@{person.username || "student"}</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="hero"
                    onClick={() => {
                      startConversationMutation.mutate({ target: person.user_id });
                      setFriendDialogOpen(false);
                    }}
                  >
                    Start Chat
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;

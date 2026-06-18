/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  Users,
  Video,
} from "lucide-react";
import { toast } from "sonner";

import StoriesCarousel from "@/components/messages/StoriesCarousel";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { formatRelativeTime } from "@/lib/utils";

interface ConversationView {
  id: string;
  otherUserId: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
}

interface MessageView {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  expires_at?: string | null;
  view_once?: boolean | null;
  viewed_at?: string | null;
  saved_by?: string[] | null;
}

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const Messages = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [disappearingEnabled, setDisappearingEnabled] = useState(true);
  const [viewOnce, setViewOnce] = useState(false);
  const [chatStyle, setChatStyle] = useState<"whatsapp" | "snapchat" | "telegram">("whatsapp");

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
          ? (supabase as any).from("profiles").select("user_id, display_name").in("user_id", otherUserIds)
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

        return {
          id: conversation.id,
          otherUserId,
          name: profile?.display_name || "Campus Member",
          lastMessage: latest?.content || "",
          time: latest?.created_at ? formatRelativeTime(latest.created_at) : "New",
          unread: 0,
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
        .select("id, sender_id, content, created_at, expires_at, view_once, viewed_at, saved_by")
        .eq("conversation_id", selectedChat)
        .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel("messages-page")
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
    // The mutation object is intentionally excluded to avoid re-opening the same
    // deep link conversation after every mutation state transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    () => conversations.filter((conversation) => conversation.name.toLowerCase().includes(searchQuery.toLowerCase())),
    [conversations, searchQuery],
  );

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessageMutation.mutate();
    }
  };

  const markViewOnceRead = async (message: MessageView) => {
    if (!user || message.sender_id === user.id || !message.view_once || message.viewed_at) return;
    await (supabase as any).from("messages").update({ viewed_at: new Date().toISOString() }).eq("id", message.id);
    queryClient.invalidateQueries({ queryKey: ["messages", selectedChat] });
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <Card className="glass-card flex w-80 shrink-0 flex-col">
        <StoriesCarousel />
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-semibold">Messages</h2>
            <Button variant="ghost" size="icon" onClick={() => toast.info("Open a profile or listing to start a new conversation.")}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search conversations..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <ScrollArea className="flex-1">
          <div className="px-2">
            {filteredConversations.map((conversation) => (
              <button key={conversation.id} onClick={() => setSelectedChat(conversation.id)} className={`flex w-full items-center gap-3 rounded-lg p-3 transition-colors hover:bg-muted/50 ${selectedChat === conversation.id ? "bg-muted" : ""}`}>
                <Avatar><AvatarFallback className="bg-accent/10 text-accent">{conversation.name.charAt(0)}</AvatarFallback></Avatar>
                <div className="min-w-0 flex-1 text-left">
                  <div className="flex items-center justify-between"><p className="truncate text-sm font-medium">{conversation.name}</p><span className="text-xs text-muted-foreground">{conversation.time}</span></div>
                  <p className="truncate text-xs text-muted-foreground">{conversation.lastMessage}</p>
                </div>
                {conversation.unread > 0 && <Badge className="flex h-5 w-5 items-center justify-center p-0 text-xs">{conversation.unread}</Badge>}
              </button>
            ))}
          </div>
        </ScrollArea>
      </Card>

      <Card className="glass-card flex flex-1 flex-col">
        {selectedConversation ? (
          <>
            <CardHeader className="border-b border-border/50 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback className="bg-primary/10 text-primary">{selectedConversation.name.charAt(0)}</AvatarFallback></Avatar>
                  <div><p className="font-semibold">{selectedConversation.name}</p><p className="text-xs text-muted-foreground">Direct message</p></div>
                </div>
                <div className="flex flex-wrap items-center justify-end gap-1">
                  {(["whatsapp", "snapchat", "telegram"] as const).map((style) => (
                    <Button key={style} variant={chatStyle === style ? "default" : "ghost"} size="sm" className="h-8 capitalize" onClick={() => setChatStyle(style)}>
                      {style}
                    </Button>
                  ))}
                  <Button variant="ghost" size="icon" onClick={() => toast.info(`Calling ${selectedConversation.name}...`)}><Phone className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => toast.info(`Video calling ${selectedConversation.name}...`)}><Video className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => toast.info("Conversation options will appear here once moderation tools are enabled.")}>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {(messagesQuery.data ?? []).map((message) => {
                  const isMine = message.sender_id === user?.id;
                  if (!isMine && message.view_once && message.viewed_at) {
                    return (
                      <div key={message.id} className="flex justify-start">
                        <div className="rounded-2xl bg-muted px-4 py-2 text-sm text-muted-foreground">View-once message opened</div>
                      </div>
                    );
                  }
                  if (!isMine && message.view_once && !message.viewed_at) {
                    markViewOnceRead(message);
                  }
                  const mineClass = chatStyle === "snapchat" ? "bg-accent text-accent-foreground" : chatStyle === "telegram" ? "bg-sky-600 text-white" : "bg-primary text-primary-foreground";
                  return (
                    <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine ? `rounded-br-md ${mineClass}` : "rounded-bl-md bg-muted"}`}>
                        <p className="text-sm">{message.content}</p>
                        <p className={`mt-1 text-xs ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                          {formatRelativeTime(message.created_at)}
                          {message.view_once && " • view once"}
                          {message.expires_at && " • 24h"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="border-t border-border/50 p-4">
              <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                <Label className="flex items-center gap-2">
                  <Switch checked={disappearingEnabled} onCheckedChange={setDisappearingEnabled} />
                  Disappear after 24h
                </Label>
                <Label className="flex items-center gap-2">
                  <Switch checked={viewOnce} onCheckedChange={setViewOnce} />
                  View once
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Input placeholder="Type a message..." value={newMessage} onChange={(event) => setNewMessage(event.target.value)} onKeyDown={handleKeyPress} className="flex-1" />
                <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                  <PopoverTrigger asChild><Button variant="ghost" size="icon"><Smile className="h-5 w-5" /></Button></PopoverTrigger>
                  <PopoverContent className="w-auto p-0" side="top"><EmojiPicker onEmojiClick={(emojiData) => { setNewMessage((current) => current + emojiData.emoji); setEmojiOpen(false); }} /></PopoverContent>
                </Popover>
                <Button variant="hero" size="icon" disabled={!newMessage.trim() || sendMessageMutation.isPending} onClick={() => sendMessageMutation.mutate()}><Send className="h-4 w-4" /></Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center"><MessageCircle className="mx-auto mb-3 h-12 w-12 text-muted-foreground" /><p className="text-muted-foreground">Select a conversation to start messaging</p></div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Messages;

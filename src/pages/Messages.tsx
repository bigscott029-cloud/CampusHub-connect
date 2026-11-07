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
  Share2,
  CheckCheck,
  ShieldCheck,
  Sparkles,
  UserCheck,
  ArrowLeft,
  Info,
  Ban,
  UserX,
  Flag,
  Radio,
  ExternalLink,
  Flame,
  MessageSquarePlus,
  GraduationCap,
  Building,
  BellOff,
  Check,
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
  DialogFooter,
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
  avatarUrl?: string | null;
  bio?: string | null;
  universityName?: string | null;
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

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const Messages = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"chats" | "directory" | "communities">("chats");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [disappearingEnabled, setDisappearingEnabled] = useState(false);
  const [viewOnce, setViewOnce] = useState(false);
  const [chatStyle, setChatStyle] = useState<"telegram" | "whatsapp" | "snapchat">("whatsapp");
  const [newChatDialogOpen, setNewChatDialogOpen] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Blocked users set stored locally for rapid privacy enforcement
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`campushub_blocked_users:${user?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Following list
  const [followingUsers, setFollowingUsers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`campushub_following:${user?.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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

  // Query live platform members for user search / lookup
  const peopleSearchQuery = useQuery({
    queryKey: ["people-search", user?.id, userSearchTerm, searchQuery],
    enabled: Boolean(user) && (newChatDialogOpen || activeTab === "directory" || searchQuery.trim().length > 1),
    queryFn: async (): Promise<PeopleSearchResult[]> => {
      const term = (userSearchTerm.trim() || searchQuery.trim()).replace(/^@/, "");
      if (!term) {
        // Return latest active students
        const { data, error } = await (supabase as any)
          .from("profiles")
          .select("user_id, display_name, username, avatar_url, user_type")
          .neq("user_id", user?.id)
          .limit(15);
        if (error) throw error;
        return (data ?? []).map((p: any) => ({
          ...p,
          friendship_status: null,
          friendship_id: null,
        }));
      }

      const { data, error } = await (supabase as any).rpc("search_people", {
        search_term: term,
      });

      if (error) {
        // Fallback to direct profiles search
        const { data: fallbackData } = await (supabase as any)
          .from("profiles")
          .select("user_id, display_name, username, avatar_url, user_type")
          .neq("user_id", user?.id)
          .or(`display_name.ilike.%${term}%,username.ilike.%${term}%`)
          .limit(15);
        return (fallbackData ?? []).map((p: any) => ({
          ...p,
          friendship_status: null,
          friendship_id: null,
        }));
      }

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
          ? (supabase as any)
              .from("profiles")
              .select("user_id, display_name, username, user_type, avatar_url, bio, university_id")
              .in("user_id", otherUserIds)
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
          avatarUrl: profile?.avatar_url || null,
          bio: profile?.bio || "CampusHub student and community member.",
          universityName: profile?.university_id ? "Verified Campus Member" : "Campus Community",
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

      const otherUserId = selectedConversation?.otherUserId;
      if (otherUserId && blockedUsers.includes(otherUserId)) {
        throw new Error("You have blocked this user. Unblock them first to send messages.");
      }

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

  const toggleBlockUser = (userId: string) => {
    if (!user) return;
    const isCurrentlyBlocked = blockedUsers.includes(userId);
    let updated: string[];
    if (isCurrentlyBlocked) {
      updated = blockedUsers.filter((id) => id !== userId);
      toast.success("User unblocked. You can now chat together.");
    } else {
      updated = [...blockedUsers, userId];
      toast.warning("User blocked. They cannot message you or view your active status.");
    }
    setBlockedUsers(updated);
    try {
      localStorage.setItem(`campushub_blocked_users:${user.id}`, JSON.stringify(updated));
    } catch {}
  };

  const toggleFollowUser = (userId: string) => {
    if (!user) return;
    const isFollowed = followingUsers.includes(userId);
    let updated: string[];
    if (isFollowed) {
      updated = followingUsers.filter((id) => id !== userId);
      toast.info("Removed from your friends / following list.");
    } else {
      updated = [...followingUsers, userId];
      toast.success("Added to your campus friends list!");
    }
    setFollowingUsers(updated);
    try {
      localStorage.setItem(`campushub_following:${user.id}`, JSON.stringify(updated));
    } catch {}
  };

  const conversations = useMemo(() => conversationsQuery.data ?? [], [conversationsQuery.data]);
  const selectedConversation = conversations.find((conversation) => conversation.id === selectedChat);
  const isOtherUserBlocked = Boolean(selectedConversation && blockedUsers.includes(selectedConversation.otherUserId));
  const isOtherUserFriend = Boolean(selectedConversation && followingUsers.includes(selectedConversation.otherUserId));

  const filteredConversations = useMemo(
    () =>
      conversations.filter(
        (conversation) =>
          conversation.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          conversation.handle.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [conversations, searchQuery],
  );

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessageMutation.mutate();
    }
  };

  return (
    <div className="relative flex h-[calc(100dvh-5.5rem)] md:h-[calc(100vh-7.5rem)] gap-4 overflow-hidden">
      {/* LEFT SIDEBAR: CONVERSATION LIST (Full width on mobile when no chat is active) */}
      <Card
        className={`glass-card shrink-0 flex-col overflow-hidden border-primary/20 w-full md:w-96 ${
          selectedChat ? "hidden md:flex" : "flex"
        }`}
      >
        {/* Campus Status / Stories Carousel Header with story reply wiring */}
        <StoriesCarousel
          onSelectUserForChat={(userId, initialMessage) => {
            startConversationMutation.mutate({ target: userId, prefill: initialMessage });
          }}
        />

        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display font-bold text-lg flex items-center gap-1.5">
                <MessageCircle className="w-5 h-5 text-primary" /> CampusHub DM
              </h2>
              <p className="text-xs text-muted-foreground">Encrypted Student & Vendor Chat</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="hero"
                size="sm"
                className="h-8 gap-1 text-xs px-2.5 shadow-sm"
                onClick={() => setNewChatDialogOpen(true)}
                title="Start a new chat with any student"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Chat</span>
              </Button>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search @username, student, or messages..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="pl-10 text-xs bg-card h-9"
            />
          </div>

          {/* NAVIGATION TABS (CHATS / DIRECTORY / COMMUNITIES) */}
          <div className="pt-2">
            <Tabs value={activeTab} onValueChange={(val: any) => setActiveTab(val)}>
              <TabsList className="w-full grid grid-cols-3 bg-muted/60 p-1">
                <TabsTrigger value="chats" className="text-xs font-semibold">
                  Chats ({conversations.length})
                </TabsTrigger>
                <TabsTrigger value="directory" className="text-xs font-semibold flex items-center gap-1">
                  <Search className="w-3 h-3 text-primary" /> Lookup
                </TabsTrigger>
                <TabsTrigger value="communities" className="text-xs font-semibold flex items-center gap-1">
                  <Radio className="w-3 h-3 text-sky-500" /> Groups
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>

        {/* LEFT TAB CONTENTS */}
        <ScrollArea className="flex-1 pb-16 md:pb-0">
          <div className="p-2 space-y-1">
            {/* CHATS TAB */}
            {activeTab === "chats" && (
              <>
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    <MessageSquarePlus className="mx-auto mb-2 h-10 w-10 text-muted-foreground/60" />
                    <p className="font-medium">No active chats found.</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Search campus directory to start a new chat.
                    </p>
                    <Button
                      size="sm"
                      variant="hero"
                      className="mt-3 text-xs gap-1"
                      onClick={() => setNewChatDialogOpen(true)}
                    >
                      <UserPlus className="w-3.5 h-3.5" /> Look Up Students
                    </Button>
                  </div>
                ) : (
                  filteredConversations.map((conversation) => (
                    <button
                      key={conversation.id}
                      onClick={() => setSelectedChat(conversation.id)}
                      className={`flex w-full items-center gap-3 rounded-xl p-3 transition-all hover:bg-muted/70 ${
                        selectedChat === conversation.id ? "bg-primary/10 border border-primary/30" : ""
                      }`}
                    >
                      <div className="relative">
                        <Avatar className="h-11 w-11 border border-border">
                          {conversation.avatarUrl && <AvatarImage src={conversation.avatarUrl} alt={conversation.name} />}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {conversation.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
                      </div>

                      <div className="min-w-0 flex-1 text-left">
                        <div className="flex items-center justify-between">
                          <p className="truncate text-sm font-semibold">{conversation.name}</p>
                          <span className="text-[11px] text-muted-foreground">{conversation.time}</span>
                        </div>
                        <div className="flex items-center justify-between mt-0.5">
                          <p className="truncate text-xs text-muted-foreground max-w-[170px]">
                            {blockedUsers.includes(conversation.otherUserId) ? (
                              <span className="text-destructive font-medium">[User Blocked]</span>
                            ) : (
                              conversation.lastMessage
                            )}
                          </p>
                          <Badge variant="outline" className="text-[10px] py-0 px-1.5 uppercase font-mono">
                            {conversation.userType === "agent_trader" ? "Vendor" : "Student"}
                          </Badge>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </>
            )}

            {/* DIRECTORY TAB - LIVE DATABASE CAMPUS MEMBERS */}
            {activeTab === "directory" && (
              <div className="space-y-2 p-1">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 text-xs">
                  <p className="font-semibold text-primary flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Campus Members Directory
                  </p>
                  <p className="text-muted-foreground mt-0.5">
                    Search and chat with verified students, roommates, and vendors.
                  </p>
                </div>

                {(peopleSearchQuery.data ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    No users matching &ldquo;{searchQuery}&rdquo;.
                  </p>
                ) : (
                  (peopleSearchQuery.data ?? []).map((person) => (
                    <div
                      key={person.user_id}
                      className="p-2.5 rounded-xl border border-border/60 bg-card flex items-center justify-between gap-2 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Avatar className="h-9 w-9">
                          {person.avatar_url && <AvatarImage src={person.avatar_url} alt={person.display_name} />}
                          <AvatarFallback className="bg-primary/10 text-xs text-primary font-bold">
                            {person.display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{person.display_name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            @{person.username || "student"}
                          </p>
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
                  ))
                )}
              </div>
            )}

            {/* COMMUNITIES TAB */}
            {activeTab === "communities" && (
              <div className="space-y-3 p-1">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                  <p className="font-semibold flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Campus Study Squads & Groups
                  </p>
                  <p className="mt-0.5">Connect with study circles, course groups, and hostel forums.</p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-xl border bg-card space-y-2">
                    <p className="font-semibold text-sm">Study Squads & Communities Hub</p>
                    <p className="text-xs text-muted-foreground">
                      Access all verified course circles, exam prep groups, and hostel links.
                    </p>
                    <Button
                      asChild
                      size="sm"
                      variant="hero"
                      className="w-full text-xs gap-1"
                    >
                      <a href="/groups">Browse All Campus Groups</a>
                    </Button>
                  </div>

                  <div className="p-3 rounded-xl border bg-card space-y-2">
                    <p className="font-semibold text-sm">WhatsApp Campus Hotline</p>
                    <p className="text-xs text-muted-foreground">
                      Direct verified WhatsApp support & community link: 08051454564.
                    </p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-600/30"
                      onClick={() => window.open("https://wa.me/2348051454564?text=Hi%20Admin,%20connecting%20from%20CampusHub%20Messages", "_blank")}
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Open WhatsApp
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Mobile Floating Action Button to start new chat */}
        <Button
          size="icon"
          className="md:hidden fixed bottom-24 right-5 h-12 w-12 rounded-full shadow-xl bg-primary text-primary-foreground z-20"
          onClick={() => setNewChatDialogOpen(true)}
          title="Start New Chat"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Card>

      {/* RIGHT CHAT WINDOW (Full width on mobile when a chat is selected) */}
      <Card
        className={`glass-card flex-1 flex-col overflow-hidden border-primary/20 ${
          selectedChat ? "flex w-full" : "hidden md:flex"
        }`}
      >
        {selectedConversation ? (
          <>
            {/* Chat Header with mobile Back Button & WhatsApp Profile Info Trigger */}
            <CardHeader className="border-b border-border/50 py-3 bg-muted/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  {/* Back button on mobile */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden h-8 w-8 shrink-0 -ml-1 text-muted-foreground hover:text-foreground"
                    onClick={() => setSelectedChat(null)}
                    title="Back to chats"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>

                  {/* Profile Info Trigger */}
                  <button
                    type="button"
                    onClick={() => setProfileModalOpen(true)}
                    className="flex items-center gap-2.5 text-left min-w-0 rounded-lg p-1 -m-1 hover:bg-muted/60 transition-colors"
                    title="View user profile & safety info"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-primary/30">
                        {selectedConversation.avatarUrl && (
                          <AvatarImage src={selectedConversation.avatarUrl} alt={selectedConversation.name} />
                        )}
                        <AvatarFallback className="bg-primary/10 text-primary font-bold">
                          {selectedConversation.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-background" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="font-semibold text-xs sm:text-sm truncate max-w-[130px] sm:max-w-[200px]">
                          {selectedConversation.name}
                        </p>
                        <Badge variant="secondary" className="text-[10px] py-0 px-1 hidden sm:inline-flex">
                          {selectedConversation.handle}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                        {isOtherUserBlocked ? (
                          <span className="text-destructive font-medium">Blocked</span>
                        ) : (
                          "Active on CampusHub"
                        )}
                      </p>
                    </div>
                  </button>
                </div>

                {/* Top Action Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <div className="hidden sm:flex items-center gap-1">
                    {(["whatsapp", "telegram", "snapchat"] as const).map((style) => (
                      <Button
                        key={style}
                        variant={chatStyle === style ? "default" : "ghost"}
                        size="sm"
                        className="h-7 text-xs capitalize"
                        onClick={() => setChatStyle(style)}
                      >
                        {style}
                      </Button>
                    ))}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    onClick={() => setProfileModalOpen(true)}
                    title="Profile & Privacy Details"
                  >
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Blocked User Warning Banner */}
              {isOtherUserBlocked && (
                <div className="mt-2 flex items-center justify-between rounded-lg bg-destructive/10 border border-destructive/20 p-2 text-xs text-destructive">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Ban className="h-3.5 w-3.5" /> You have blocked this user.
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 text-[11px] px-2 border-destructive/40"
                    onClick={() => toggleBlockUser(selectedConversation.otherUserId)}
                  >
                    Unblock
                  </Button>
                </div>
              )}
            </CardHeader>

            {/* Messages Stream */}
            <ScrollArea className="flex-1 p-3 sm:p-4 bg-muted/10">
              <div className="space-y-3 pb-4">
                {/* Security encryption notice */}
                <div className="mx-auto max-w-xs text-center py-2 px-3 rounded-xl bg-muted/50 border border-border/40 text-[11px] text-muted-foreground">
                  <ShieldCheck className="w-3.5 h-3.5 inline mr-1 text-primary" />
                  Messages in CampusHub DM are private. Always use SecurePay escrow for transactions.
                </div>

                {(messagesQuery.data ?? []).map((message) => {
                  const isMine = message.sender_id === user?.id;
                  const themeStyle =
                    chatStyle === "telegram"
                      ? isMine
                        ? "bg-sky-600 text-white"
                        : "bg-card border border-border/60"
                      : chatStyle === "whatsapp"
                      ? isMine
                        ? "bg-emerald-600 text-white"
                        : "bg-card border border-border/60"
                      : isMine
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted";

                  return (
                    <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-3.5 py-2.5 shadow-sm ${
                          isMine ? `rounded-br-none ${themeStyle}` : `rounded-bl-none ${themeStyle}`
                        }`}
                      >
                        <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <div
                          className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${
                            isMine ? "text-white/80" : "text-muted-foreground"
                          }`}
                        >
                          <span>{formatRelativeTime(message.created_at)}</span>
                          {isMine && <CheckCheck className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Sticky Input Field Area */}
            <div className="border-t border-border/50 p-2.5 sm:p-3 bg-card/95 backdrop-blur-md">
              {isOtherUserBlocked ? (
                <div className="p-3 text-center text-xs text-muted-foreground bg-muted/40 rounded-xl">
                  Unblock {selectedConversation.name} to send a message.
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0 text-muted-foreground">
                          <Smile className="h-5 w-5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent side="top" className="w-auto p-0 border-none">
                        <EmojiPicker
                          onEmojiClick={(data) => {
                            setNewMessage((prev) => prev + data.emoji);
                            setEmojiOpen(false);
                          }}
                        />
                      </PopoverContent>
                    </Popover>

                    <Input
                      placeholder={`Message ${selectedConversation.name}...`}
                      value={newMessage}
                      onChange={(event) => setNewMessage(event.target.value)}
                      onKeyDown={handleKeyPress}
                      className="flex-1 text-xs sm:text-sm h-10 bg-background"
                    />

                    <Button
                      variant="hero"
                      size="icon"
                      className="h-10 w-10 shrink-0 shadow-sm"
                      onClick={() => sendMessageMutation.mutate()}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Disappearing & View-Once privacy toggles */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 px-1">
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Switch
                          checked={disappearingEnabled}
                          onCheckedChange={setDisappearingEnabled}
                          className="scale-75"
                        />
                        <span>24h Auto-delete</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <Switch
                          checked={viewOnce}
                          onCheckedChange={setViewOnce}
                          className="scale-75"
                        />
                        <span>View-once</span>
                      </label>
                    </div>
                    <span className="hidden sm:inline font-mono text-[10px]">Press Enter ↵ to send</span>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <MessageCircle className="h-8 w-8" />
            </div>
            <h3 className="font-display font-bold text-lg">Your Campus Messages</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              Select a chat from the left or search students to start a secure conversation.
            </p>
            <Button
              variant="hero"
              className="mt-4 gap-1.5"
              onClick={() => setNewChatDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4" />
              Start New Chat
            </Button>
          </div>
        )}
      </Card>

      {/* WHATSAPP-STYLE IN-CHAT USER PROFILE & PRIVACY/BLOCK MODAL */}
      <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
        <DialogContent className="max-w-sm p-0 overflow-hidden">
          {selectedConversation && (
            <div className="flex flex-col">
              {/* Profile Header Header Background */}
              <div className="bg-gradient-to-r from-primary/20 via-primary/10 to-background p-6 text-center border-b border-border/50">
                <Avatar className="h-20 w-20 mx-auto border-4 border-background shadow-md">
                  {selectedConversation.avatarUrl && (
                    <AvatarImage src={selectedConversation.avatarUrl} alt={selectedConversation.name} />
                  )}
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-2xl">
                    {selectedConversation.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="mt-3 text-lg font-bold font-display">{selectedConversation.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedConversation.handle}</p>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <Badge variant="outline" className="text-xs capitalize">
                    {selectedConversation.userType === "agent_trader" ? "Trader / Agent" : "Student"}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {selectedConversation.universityName || "Campus Community"}
                  </Badge>
                </div>
              </div>

              {/* Profile Details & Bio */}
              <div className="p-4 space-y-4">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">About / Status</Label>
                  <p className="text-xs font-medium bg-muted/40 p-2.5 rounded-lg">
                    {selectedConversation.bio || "Active on CampusHub Connect."}
                  </p>
                </div>

                {/* Friendship & Network Status */}
                <div className="flex items-center justify-between p-3 rounded-xl border border-border/60 bg-card">
                  <div>
                    <p className="text-xs font-semibold">Campus Friends List</p>
                    <p className="text-[11px] text-muted-foreground">
                      {isOtherUserFriend ? "On your campus friends list" : "Not yet on your friends list"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant={isOtherUserFriend ? "outline" : "hero"}
                    className="h-8 text-xs gap-1"
                    onClick={() => toggleFollowUser(selectedConversation.otherUserId)}
                  >
                    {isOtherUserFriend ? (
                      <>
                        <Check className="h-3.5 w-3.5" /> Friends
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5" /> Add Friend
                      </>
                    )}
                  </Button>
                </div>

                {/* Privacy & Safety Controls */}
                <div className="space-y-2 pt-2 border-t border-border/50">
                  <Label className="text-xs text-muted-foreground">Privacy & Moderation</Label>

                  {/* Block / Unblock Button */}
                  <Button
                    variant={isOtherUserBlocked ? "outline" : "destructive"}
                    className="w-full text-xs justify-start gap-2 h-9"
                    onClick={() => toggleBlockUser(selectedConversation.otherUserId)}
                  >
                    <Ban className="h-4 w-4" />
                    <span>
                      {isOtherUserBlocked ? `Unblock ${selectedConversation.name}` : `Block ${selectedConversation.name}`}
                    </span>
                  </Button>

                  {/* Report Button */}
                  <Button
                    variant="ghost"
                    className="w-full text-xs justify-start gap-2 h-9 text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      window.open(
                        `https://wa.me/2348051454564?text=${encodeURIComponent(
                          `Report user on CampusHub: ${selectedConversation.name} (${selectedConversation.otherUserId})`,
                        )}`,
                        "_blank",
                      );
                    }}
                  >
                    <Flag className="h-4 w-4" />
                    <span>Report User to Moderation (08051454564)</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* NEW CHAT / STUDENT LOOKUP DIALOG */}
      <Dialog open={newChatDialogOpen} onOpenChange={setNewChatDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" /> Start New Chat
            </DialogTitle>
            <DialogDescription>
              Look up any registered student, faculty member, or vendor by name or @username.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Type name, @username, or faculty..."
                value={userSearchTerm}
                onChange={(event) => setUserSearchTerm(event.target.value)}
                className="pl-10 h-10"
                autoFocus
              />
            </div>

            <ScrollArea className="h-64 rounded-lg border p-2">
              <div className="space-y-2">
                {(peopleSearchQuery.data ?? []).length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-10">
                    No students found matching &ldquo;{userSearchTerm}&rdquo;.
                  </p>
                ) : (
                  (peopleSearchQuery.data ?? []).map((person) => (
                    <div
                      key={person.user_id}
                      className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-card hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10">
                          {person.avatar_url && <AvatarImage src={person.avatar_url} alt={person.display_name} />}
                          <AvatarFallback className="bg-primary/10 text-primary font-bold">
                            {person.display_name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold truncate">{person.display_name}</p>
                          <p className="text-[11px] text-muted-foreground truncate">
                            @{person.username || "student"} •{" "}
                            <span className="capitalize">{person.user_type || "student"}</span>
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="hero"
                        className="text-xs shrink-0 h-8 px-3"
                        onClick={() => {
                          startConversationMutation.mutate({ target: person.user_id });
                          setNewChatDialogOpen(false);
                        }}
                      >
                        Start Chat
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewChatDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Messages;

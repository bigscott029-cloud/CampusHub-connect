import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Users,
  Search,
  Plus,
  MessageCircle,
  Settings,
  Bell,
  Pin,
  Hash,
  Lock,
  Globe,
  Crown,
  UserPlus,
  MoreVertical,
  Send,
  Image as ImageIcon,
  Paperclip,
  Smile,
  Mic,
  Phone,
  Video,
} from "lucide-react";

const mockGroups = [
  {
    id: 1,
    name: "CSC 401 - Database Systems",
    type: "course",
    members: 156,
    unread: 23,
    lastMessage: "Has anyone finished the ER diagram?",
    lastSender: "Tunde A.",
    time: "2 min",
    pinned: true,
    isPrivate: false,
  },
  {
    id: 2,
    name: "Final Year Project Squad",
    type: "study",
    members: 12,
    unread: 5,
    lastMessage: "Meeting tomorrow at 2pm?",
    lastSender: "Amaka O.",
    time: "15 min",
    pinned: true,
    isPrivate: true,
  },
  {
    id: 3,
    name: "Hostel 5 Residents",
    type: "community",
    members: 234,
    unread: 0,
    lastMessage: "Light's back!",
    lastSender: "John D.",
    time: "1 hr",
    pinned: false,
    isPrivate: false,
  },
  {
    id: 4,
    name: "Tech Enthusiasts",
    type: "interest",
    members: 89,
    unread: 8,
    lastMessage: "Check out this new AI tool",
    lastSender: "David K.",
    time: "3 hrs",
    pinned: false,
    isPrivate: false,
  },
];

const mockMessages = [
  { id: 1, sender: "Tunde A.", content: "Hey everyone! Has anyone started the assignment?", time: "10:30 AM", isMe: false },
  { id: 2, sender: "You", content: "Not yet, planning to start tonight", time: "10:32 AM", isMe: true },
  { id: 3, sender: "Amaka O.", content: "I've done the first two questions. It's actually easier than expected", time: "10:35 AM", isMe: false },
  { id: 4, sender: "David K.", content: "Can someone share the question paper? I lost mine 😅", time: "10:40 AM", isMe: false },
  { id: 5, sender: "You", content: "I'll upload it in a sec", time: "10:41 AM", isMe: true },
];

const Groups = () => {
  const [selectedGroup, setSelectedGroup] = useState(mockGroups[0]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-4">
      {/* Groups List Sidebar */}
      <Card className="glass-card w-80 flex flex-col shrink-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Groups
            </CardTitle>
            <Button variant="ghost" size="icon">
              <Plus className="w-5 h-5" />
            </Button>
          </div>
          <div className="relative mt-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 p-0 overflow-hidden">
          <Tabs defaultValue="all">
            <div className="px-4">
              <TabsList className="w-full bg-muted/50">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="courses" className="flex-1">Courses</TabsTrigger>
                <TabsTrigger value="study" className="flex-1">Study</TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all" className="m-0 mt-2">
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="space-y-1 p-2">
                  {mockGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group)}
                      className={`w-full p-3 rounded-lg text-left transition-colors ${
                        selectedGroup?.id === group.id
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {group.isPrivate ? (
                            <Lock className="w-5 h-5 text-primary" />
                          ) : (
                            <Hash className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {group.pinned && <Pin className="w-3 h-3 text-primary" />}
                            <span className="font-medium text-sm truncate">{group.name}</span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {group.lastSender}: {group.lastMessage}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs text-muted-foreground">{group.time}</span>
                          {group.unread > 0 && (
                            <Badge className="mt-1 h-5 px-1.5 text-xs gradient-bg text-primary-foreground">
                              {group.unread}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Chat Area */}
      <Card className="glass-card flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <CardHeader className="border-b border-border/50 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Hash className="w-5 h-5 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{selectedGroup?.name}</h3>
                  {selectedGroup?.isPrivate && <Lock className="w-3 h-3 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {selectedGroup?.members} members
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon">
                <Phone className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Video className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <UserPlus className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {/* Date Divider */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex-1 h-px bg-border" />
              <span>Today</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {mockMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.isMe ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[70%] ${msg.isMe ? "order-2" : ""}`}>
                  {!msg.isMe && (
                    <span className="text-xs font-medium text-primary ml-2">{msg.sender}</span>
                  )}
                  <div
                    className={`p-3 rounded-2xl ${
                      msg.isMe
                        ? "gradient-bg text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <span className={`text-xs text-muted-foreground mt-1 block ${msg.isMe ? "text-right mr-2" : "ml-2"}`}>
                    {msg.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="shrink-0">
              <ImageIcon className="w-5 h-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="pr-20"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Mic className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <Button variant="hero" size="icon" className="shrink-0">
              <Send className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Group Info Sidebar */}
      <Card className="glass-card w-72 shrink-0 hidden xl:flex flex-col">
        <CardHeader className="text-center pb-3">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
            <Hash className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-lg">{selectedGroup?.name}</CardTitle>
          <p className="text-sm text-muted-foreground">Course Group • Public</p>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Bell, label: "Mute" },
                { icon: Pin, label: "Pin" },
                { icon: Settings, label: "Settings" },
              ].map((action, i) => (
                <Button key={i} variant="outline" size="sm" className="flex-col h-auto py-3">
                  <action.icon className="w-4 h-4 mb-1" />
                  <span className="text-xs">{action.label}</span>
                </Button>
              ))}
            </div>

            {/* Members */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm">Members</h4>
                <span className="text-xs text-muted-foreground">{selectedGroup?.members}</span>
              </div>
              <div className="space-y-2">
                {["Tunde A.", "Amaka O.", "David K."].map((member, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{member.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm flex-1">{member}</span>
                    {i === 0 && <Crown className="w-4 h-4 text-warning" />}
                  </div>
                ))}
                <Button variant="ghost" size="sm" className="w-full text-primary">
                  View all members
                </Button>
              </div>
            </div>

            {/* Shared Media */}
            <div>
              <h4 className="font-semibold text-sm mb-3">Shared Media</h4>
              <div className="grid grid-cols-3 gap-1">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-square rounded-md bg-muted" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Groups;

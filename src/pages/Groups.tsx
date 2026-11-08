import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Search,
  Plus,
  MessageCircle,
  Hash,
  ExternalLink,
  BookOpen,
  Code,
  GraduationCap,
  Building,
  Music,
  Heart,
  Share2,
  CheckCircle2,
  PhoneCall,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface CampusGroup {
  id: string;
  name: string;
  description: string;
  category: "department" | "tech" | "examprep" | "hostel" | "creative" | "faith" | "social";
  campus: string;
  membersCount: number;
  activeTodayCount: number;
  whatsappLink?: string;
  isVerified: boolean;
  avatarIcon: any;
  accentColor: string;
  tags: string[];
}

const CATEGORY_ICONS: Record<string, any> = {
  department: GraduationCap,
  tech: Code,
  examprep: BookOpen,
  hostel: Building,
  creative: Music,
  faith: Heart,
  social: Users,
};

const DEFAULT_GROUPS: CampusGroup[] = [
  {
    id: "tech-build-camp",
    name: "Campus Tech & Founders Hub",
    description: "Developers, UI/UX designers, AI hobbyists, and early-stage student builders shipping products.",
    category: "tech",
    campus: "National / Multi-Campus",
    membersCount: 842,
    activeTodayCount: 94,
    whatsappLink: "https://wa.me/2348051454564?text=Hi%20Admin,%20please%20add%20me%20to%20the%20Campus%20Tech%20Founders%20Hub",
    isVerified: true,
    avatarIcon: Code,
    accentColor: "from-blue-600 to-cyan-500",
    tags: ["Coding", "React", "Python", "Hackathons"],
  },
  {
    id: "csc-400-finalists",
    name: "Computer Science 400L / Finalist Circle",
    description: "Final year project collaboration, thesis defense preparation, seminar topics, and past questions bank.",
    category: "department",
    campus: "Faculty of Science / Computing",
    membersCount: 312,
    activeTodayCount: 46,
    whatsappLink: "https://wa.me/2348051454564?text=Hi%20Admin,%20joining%20CSC%20400L%20Study%20Circle",
    isVerified: true,
    avatarIcon: GraduationCap,
    accentColor: "from-indigo-600 to-violet-500",
    tags: ["CSC 401", "Project Defense", "Past Questions", "Seminars"],
  },
  {
    id: "exam-past-q-squad",
    name: "National GST & General Exam Prep Squad",
    description: "Weekly test reviews, solved CBT past questions, memory mnemonics, and exam survival tips.",
    category: "examprep",
    campus: "Cross-Institution GST Prep",
    membersCount: 1250,
    activeTodayCount: 180,
    whatsappLink: "https://wa.me/2348051454564?text=Hi%20Admin,%20add%20me%20to%20GST%20Exam%20Prep%20Squad",
    isVerified: true,
    avatarIcon: BookOpen,
    accentColor: "from-emerald-600 to-teal-500",
    tags: ["GST 101", "CBT Practice", "Solved Q&A", "First Class Circle"],
  },
  {
    id: "law-moot-society",
    name: "Campus Bar & Moot Court Society",
    description: "Mock trials, constitutional law debate nights, legal drafting clinics, and inter-faculty rivalry mock competitions.",
    category: "department",
    campus: "Faculty of Law",
    membersCount: 198,
    activeTodayCount: 29,
    whatsappLink: "https://wa.me/2348051454564?text=Hi%20Admin,%20joining%20Campus%20Bar%20Moot%20Court%20Society",
    isVerified: true,
    avatarIcon: GraduationCap,
    accentColor: "from-amber-600 to-orange-500",
    tags: ["Jurisprudence", "Moot Court", "Debates", "Legal Clinic"],
  },
  {
    id: "hostel-residents-network",
    name: "Hostel Blocks & Off-Campus Roommates League",
    description: "Updates on hostel gate hours, power/water supply status, emergency repairs, and verified roommate vacancies.",
    category: "hostel",
    campus: "All Hostels & Off-Campus Zones",
    membersCount: 960,
    activeTodayCount: 112,
    whatsappLink: "https://wa.me/2348051454564?text=Hi%20Admin,%20joining%20Hostel%20Residents%20Network",
    isVerified: true,
    avatarIcon: Building,
    accentColor: "from-rose-600 to-pink-500",
    tags: ["Power Alerts", "Water Supply", "Security Notice", "Roommates"],
  },
  {
    id: "campus-creatives-media",
    name: "Creative Writers, Photographers & Podcasters",
    description: "Showcasing student music, poetry, campus magazine articles, photography exhibitions, and live audio podcasts.",
    category: "creative",
    campus: "Arts & Entertainment Hub",
    membersCount: 420,
    activeTodayCount: 58,
    whatsappLink: "https://wa.me/2348051454564?text=Hi%20Admin,%20joining%20Campus%20Creatives%20Hub",
    isVerified: true,
    avatarIcon: Music,
    accentColor: "from-purple-600 to-pink-600",
    tags: ["Podcasts", "Photography", "Poetry", "Campus Vibe"],
  },
  {
    id: "med-pharm-fellows",
    name: "College of Medicine & Pharmacy Scholars",
    description: "Anatomy flashcards, pathology slide reviews, clinical ward round discussions, and pharmacology mnemonics.",
    category: "department",
    campus: "College of Health Sciences",
    membersCount: 380,
    activeTodayCount: 64,
    whatsappLink: "https://wa.me/2348051454564?text=Hi%20Admin,%20joining%20College%20of%20Medicine%20Scholars",
    isVerified: true,
    avatarIcon: Heart,
    accentColor: "from-red-600 to-rose-500",
    tags: ["Anatomy", "Ward Rounds", "Pharmacology", "Study Tips"],
  },
  {
    id: "campus-christian-muslim-interfaith",
    name: "Campus Fellowship & Devotional Circles",
    description: "Weekly scripture devotionals, peaceful interfaith academic support, prayer requests, and campus benevolence drives.",
    category: "faith",
    campus: "Chapel & Mosque Campus Communities",
    membersCount: 540,
    activeTodayCount: 71,
    whatsappLink: "https://wa.me/2348051454564?text=Hi%20Admin,%20joining%20Fellowship%20Circle",
    isVerified: false,
    avatarIcon: Heart,
    accentColor: "from-sky-600 to-blue-500",
    tags: ["Fellowship", "Benevolence", "Study Circle", "Prayer Requests"],
  },
];

const Groups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New Group Form State
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupCategory, setNewGroupCategory] = useState("department");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [newGroupTags, setNewGroupTags] = useState("");
  const [newGroupWhatsapp, setNewGroupWhatsapp] = useState("");
  const [customGroups, setCustomGroups] = useState<CampusGroup[]>(() => {
    try {
      const saved = localStorage.getItem("campushub_user_created_groups");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Fetch user's university context for personalized suggestions
  const { data: userUniversity } = useQuery({
    queryKey: ["user-group-university", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("university_id, display_name")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!profile?.university_id) return null;

      const { data: uni } = await supabase
        .from("universities")
        .select("id, name, slug, campus_motto")
        .eq("id", profile.university_id)
        .maybeSingle();

      return uni;
    },
    staleTime: 1000 * 60 * 15,
  });

  const allGroups = useMemo(() => {
    return [...customGroups, ...DEFAULT_GROUPS];
  }, [customGroups]);

  const filteredGroups = useMemo(() => {
    return allGroups.filter((group) => {
      const matchesSearch =
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === "all" || group.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [allGroups, searchQuery, selectedCategory]);

  const handleShareGroup = (group: CampusGroup) => {
    const text = `Join ${group.name} on CampusHub Connect! Let's study and connect together.`;
    if (navigator.share) {
      navigator.share({
        title: group.name,
        text,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${text}\n${window.location.href}`);
      toast.success("Group link copied to clipboard!");
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || !newGroupDescription.trim()) {
      toast.error("Please fill in the group name and description.");
      return;
    }

    const tagsArray = newGroupTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const createdGroup: CampusGroup = {
      id: `custom-${Date.now()}`,
      name: newGroupName.trim(),
      description: newGroupDescription.trim(),
      category: newGroupCategory as any,
      campus: userUniversity?.name || "Campus Community",
      membersCount: 1,
      activeTodayCount: 1,
      whatsappLink: newGroupWhatsapp.trim() || `https://wa.me/2348051454564?text=Hi%20Admin,%20inquiring%20about%20group:%20${encodeURIComponent(newGroupName)}`,
      isVerified: false,
      avatarIcon: CATEGORY_ICONS[newGroupCategory] || Users,
      accentColor: "from-primary to-blue-600",
      tags: tagsArray.length > 0 ? tagsArray : ["Campus Group", "Students"],
    };

    const updated = [createdGroup, ...customGroups];
    setCustomGroups(updated);
    try {
      localStorage.setItem("campushub_user_created_groups", JSON.stringify(updated));
    } catch {}

    toast.success("Campus group created successfully! Welcome your first members.");
    setCreateModalOpen(false);
    setNewGroupName("");
    setNewGroupDescription("");
    setNewGroupTags("");
    setNewGroupWhatsapp("");
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-20">
      {/* Top Banner & Header */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Users className="h-5 w-5" />
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-bold">
                Campus Groups & Communities
              </h1>
            </div>
            <p className="text-sm text-muted-foreground max-w-2xl">
              {userUniversity ? (
                <>Personalized for students at <span className="font-semibold text-foreground">{userUniversity.name}</span>. Join study squads, departmental forums, hostel links, and hobby hubs.</>
              ) : (
                <>Connect with verified study squads, course departments, hostel alliances, and creative societies across Nigerian campuses.</>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2 shadow-sm" variant="hero">
                  <Plus className="h-4 w-4" />
                  Create Group
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Create a Campus Community
                  </DialogTitle>
                  <DialogDescription>
                    Start a study squad, departmental circle, or hobby group for your campus.
                  </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleCreateGroup} className="space-y-4 py-2">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Community / Group Name *</Label>
                    <Input
                      id="group-name"
                      placeholder="e.g., Computer Engineering 300L Hub"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-category">Category</Label>
                    <Select value={newGroupCategory} onValueChange={setNewGroupCategory}>
                      <SelectTrigger id="group-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="department">Department & Courses</SelectItem>
                        <SelectItem value="tech">Tech & Developers</SelectItem>
                        <SelectItem value="examprep">Exam Prep & Past Questions</SelectItem>
                        <SelectItem value="hostel">Hostel & Housing Zone</SelectItem>
                        <SelectItem value="creative">Creative Arts & Media</SelectItem>
                        <SelectItem value="faith">Fellowship & Devotionals</SelectItem>
                        <SelectItem value="social">Social & Lifestyle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-description">Short Description / Purpose *</Label>
                    <Textarea
                      id="group-description"
                      placeholder="Describe what members will do, weekly study schedules, or group rules..."
                      rows={3}
                      value={newGroupDescription}
                      onChange={(e) => setNewGroupDescription(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-tags">Tags (Comma-separated)</Label>
                    <Input
                      id="group-tags"
                      placeholder="e.g. MEE 311, Past Questions, Tutorials"
                      value={newGroupTags}
                      onChange={(e) => setNewGroupTags(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="group-whatsapp">WhatsApp Group Link or Admin Phone (Optional)</Label>
                    <Input
                      id="group-whatsapp"
                      placeholder="https://chat.whatsapp.com/... or 08051454564"
                      value={newGroupWhatsapp}
                      onChange={(e) => setNewGroupWhatsapp(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Defaults to verified CampusHub WhatsApp line if empty.
                    </p>
                  </div>

                  <DialogFooter className="pt-3">
                    <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="hero">
                      Launch Community
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button asChild variant="outline" className="gap-2">
              <Link to="/messages">
                <MessageCircle className="h-4 w-4" />
                My Chats
              </Link>
            </Button>
          </div>
        </div>

        {/* Live Safety Note */}
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 font-medium text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Verified Student Moderation
          </span>
          <span>•</span>
          <span>Zero-spam policy</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <PhoneCall className="h-3 w-3" />
            Direct Admin Support: 08051454564
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search communities by name, course code (e.g. CSC 401), or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 bg-card/60"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="h-auto flex-wrap justify-start gap-1.5 bg-muted/40 p-1.5 rounded-xl border">
          <TabsTrigger value="all" className="rounded-lg text-xs md:text-sm py-1.5 px-3">
            All Groups ({allGroups.length})
          </TabsTrigger>
          <TabsTrigger value="department" className="rounded-lg text-xs md:text-sm py-1.5 px-3 gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="tech" className="rounded-lg text-xs md:text-sm py-1.5 px-3 gap-1.5">
            <Code className="h-3.5 w-3.5" />
            Tech & Builders
          </TabsTrigger>
          <TabsTrigger value="examprep" className="rounded-lg text-xs md:text-sm py-1.5 px-3 gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Exam Prep
          </TabsTrigger>
          <TabsTrigger value="hostel" className="rounded-lg text-xs md:text-sm py-1.5 px-3 gap-1.5">
            <Building className="h-3.5 w-3.5" />
            Hostels & Housing
          </TabsTrigger>
          <TabsTrigger value="creative" className="rounded-lg text-xs md:text-sm py-1.5 px-3 gap-1.5">
            <Music className="h-3.5 w-3.5" />
            Creatives
          </TabsTrigger>
          <TabsTrigger value="faith" className="rounded-lg text-xs md:text-sm py-1.5 px-3 gap-1.5">
            <Heart className="h-3.5 w-3.5" />
            Fellowship
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {filteredGroups.length === 0 ? (
            <Card className="border-dashed p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Hash className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No communities found</h3>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
                No group matched &ldquo;{searchQuery}&rdquo;. Try another keyword or create the first community!
              </p>
              <Button
                variant="hero"
                className="mt-5 gap-2"
                onClick={() => setCreateModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Start &ldquo;{searchQuery || "New Group"}&rdquo;
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredGroups.map((group) => {
                const IconComponent = CATEGORY_ICONS[group.category] || Users;
                return (
                  <Card
                    key={group.id}
                    className="group relative flex flex-col justify-between overflow-hidden border transition-all duration-200 hover:border-primary/50 hover:shadow-md bg-card/80 backdrop-blur-sm"
                  >
                    {/* Top Accent Gradient Bar */}
                    <div className={`h-1.5 w-full bg-gradient-to-r ${group.accentColor}`} />

                    <CardHeader className="pb-3 pt-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${group.accentColor} text-white shadow-sm`}>
                            <IconComponent className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-1">
                                {group.name}
                              </CardTitle>
                              {group.isVerified && (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-500 fill-blue-500/10" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {group.campus}
                            </span>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
                          onClick={() => handleShareGroup(group)}
                          title="Share community"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <CardDescription className="mt-2.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {group.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-0">
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {group.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-[11px] font-normal py-0 px-2 bg-muted/60"
                          >
                            #{tag}
                          </Badge>
                        ))}
                      </div>

                      {/* Members & Activity */}
                      <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-primary" />
                          <span className="font-medium text-foreground">{group.membersCount}</span> members
                        </div>
                        <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                          <Flame className="h-3.5 w-3.5 text-amber-500" />
                          <span>{group.activeTodayCount} active today</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs gap-1.5 border-emerald-600/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                          onClick={() => {
                            if (group.whatsappLink) {
                              window.open(group.whatsappLink, "_blank", "noopener,noreferrer");
                            } else {
                              window.open("https://wa.me/2348051454564?text=" + encodeURIComponent(`Hi Admin, please connect me with ${group.name}`), "_blank");
                            }
                          }}
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          WhatsApp
                        </Button>

                        <Button
                          variant="hero"
                          size="sm"
                          className="w-full text-xs gap-1.5"
                          onClick={() => {
                            navigate(`/messages?to=${encodeURIComponent(group.id)}&message=${encodeURIComponent(`Hi everyone! I just joined the ${group.name} on CampusHub.`)}`);
                          }}
                        >
                          <MessageCircle className="h-3.5 w-3.5" />
                          Chat
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Groups;

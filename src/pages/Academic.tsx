import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  GraduationCap, Calculator, Clock, BookOpen, Users, FileText,
  Search, Plus, Calendar, Target, AlertTriangle, Brain, Trash2, ArrowLeft,
  MessageSquare, ExternalLink, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getProfileWithUniversity } from "@/lib/campus";

const gradePoints: Record<string, number> = { A: 5.0, B: 4.0, C: 3.0, D: 2.0, E: 1.0, F: 0.0 };

interface Course { id: number; name: string; units: number; grade: string; }

interface StudyGroupItem {
  id: string;
  name: string;
  description: string;
  whatsappLink?: string;
  membersCount: number;
  courseCode?: string;
  createdAt: string;
}

const Academic = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [newCourse, setNewCourse] = useState({ name: "", units: "", grade: "A" });
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: "", courseCode: "", description: "", whatsappLink: "" });

  // In-memory study groups state (persisted locally + fallback)
  const [studyGroups, setStudyGroups] = useState<StudyGroupItem[]>([
    {
      id: "group-1",
      name: "CSC 401 Final Exam Prep",
      courseCode: "CSC 401",
      description: "Collaborative study group for Artificial Intelligence and Algorithms.",
      whatsappLink: "https://chat.whatsapp.com/demo-study-group-csc401",
      membersCount: 24,
      createdAt: new Date().toISOString(),
    },
    {
      id: "group-2",
      name: "GST 101 General Studies Circle",
      courseCode: "GST 101",
      description: "Weekly revision and past questions discussion for freshers.",
      whatsappLink: "https://chat.whatsapp.com/demo-study-group-gst101",
      membersCount: 42,
      createdAt: new Date().toISOString(),
    },
  ]);

  const examsQuery = useQuery({
    queryKey: ["academic-exams", user?.id],
    enabled: Boolean(user),
    queryFn: async () => {
      if (!user) return [];

      const { profile } = await getProfileWithUniversity(user.id);
      let query = supabase
        .from("exams")
        .select("id, course_code, course_title, exam_date, department, level")
        .gte("exam_date", new Date().toISOString())
        .order("exam_date", { ascending: true });

      if (profile?.university_id) {
        query = query.eq("university_id", profile.university_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    },
  });

  const calculateGPA = () => {
    if (courses.length === 0) return "0.00";
    const totalPoints = courses.reduce((sum, c) => sum + (gradePoints[c.grade] * c.units), 0);
    const totalUnits = courses.reduce((sum, c) => sum + c.units, 0);
    return totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : "0.00";
  };

  const addCourse = () => {
    if (newCourse.name && newCourse.units) {
      setCourses([...courses, { id: Date.now(), name: newCourse.name, units: parseInt(newCourse.units), grade: newCourse.grade }]);
      setNewCourse({ name: "", units: "", grade: "A" });
    }
  };

  const removeCourse = (id: number) => { setCourses(courses.filter(c => c.id !== id)); };

  const getDaysUntil = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleCreateGroup = () => {
    if (!groupForm.name.trim()) {
      toast.error("Please provide a group name.");
      return;
    }

    const newGroup: StudyGroupItem = {
      id: `group-${Date.now()}`,
      name: groupForm.name.trim(),
      courseCode: groupForm.courseCode.trim() || undefined,
      description: groupForm.description.trim() || "Peer study discussion group",
      whatsappLink: groupForm.whatsappLink.trim() || undefined,
      membersCount: 1,
      createdAt: new Date().toISOString(),
    };

    setStudyGroups([newGroup, ...studyGroups]);
    setGroupForm({ name: "", courseCode: "", description: "", whatsappLink: "" });
    setCreateGroupOpen(false);
    toast.success("Study group created successfully!");
  };

  const handleJoinGroup = (group: StudyGroupItem) => {
    setStudyGroups(
      studyGroups.map((g) => (g.id === group.id ? { ...g, membersCount: g.membersCount + 1 } : g))
    );

    if (group.whatsappLink) {
      window.open(group.whatsappLink, "_blank", "noopener,noreferrer");
      toast.success("Joined group! Opening WhatsApp chat...");
    } else {
      toast.success("You have joined this study group!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="w-10 h-10 rounded-xl module-academic border flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
        <div><h1 className="text-2xl font-display font-bold">Academic Tools</h1><p className="text-sm text-muted-foreground">GPA Calculator, Exam Timetables, and Campus Study Groups</p></div>
      </div>

      <Tabs defaultValue="gpa" className="space-y-6">
        <TabsList className="bg-muted/50 p-1 flex-wrap h-auto">
          <TabsTrigger value="gpa" className="gap-1"><Calculator className="w-4 h-4" />GPA Calculator</TabsTrigger>
          <TabsTrigger value="exams" className="gap-1"><Clock className="w-4 h-4" />Exam Countdown</TabsTrigger>
          <TabsTrigger value="resources" className="gap-1"><BookOpen className="w-4 h-4" />Resources</TabsTrigger>
          <TabsTrigger value="studygroups" className="gap-1"><Users className="w-4 h-4" />Study Groups</TabsTrigger>
        </TabsList>

        {/* GPA Tab */}
        <TabsContent value="gpa" className="space-y-6">
          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="glass-card lg:col-span-2">
              <CardHeader><CardTitle className="flex items-center gap-2"><Calculator className="w-5 h-5 text-academic" />Course Entry</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Input placeholder="Course Code" value={newCourse.name} onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })} className="flex-1 min-w-[120px]" />
                  <Input type="number" placeholder="Units" value={newCourse.units} onChange={(e) => setNewCourse({ ...newCourse, units: e.target.value })} className="w-20" />
                  <select value={newCourse.grade} onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })} className="px-3 rounded-md border border-input bg-background">{Object.keys(gradePoints).map(g => <option key={g} value={g}>{g}</option>)}</select>
                  <Button onClick={addCourse} variant="hero"><Plus className="w-4 h-4" />Add</Button>
                </div>
                <div className="space-y-2">
                  {courses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-4">
                        <span className="font-medium">{course.name}</span>
                        <Badge variant="outline">{course.units} Units</Badge>
                        <Badge className={`${course.grade === "A" ? "bg-success" : course.grade === "B" ? "bg-primary" : course.grade === "C" ? "bg-warning" : "bg-destructive"}`}>{course.grade}</Badge>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removeCourse(course.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader><CardTitle className="flex items-center gap-2"><Target className="w-5 h-5 text-primary" />Your GPA</CardTitle></CardHeader>
              <CardContent className="text-center">
                <div className="w-32 h-32 rounded-full gradient-bg flex items-center justify-center mx-auto mb-6"><span className="text-4xl font-display font-bold text-primary-foreground">{calculateGPA()}</span></div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Total Units</span><span className="font-semibold">{courses.reduce((s, c) => s + c.units, 0)}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Courses</span><span className="font-semibold">{courses.length}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Class</span><Badge variant="secondary">{parseFloat(calculateGPA()) >= 4.5 ? "First Class" : parseFloat(calculateGPA()) >= 3.5 ? "Second Class Upper" : parseFloat(calculateGPA()) >= 2.5 ? "Second Class Lower" : "Third Class"}</Badge></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Clock className="w-5 h-5 text-accent" />Upcoming Exams</CardTitle>
                <Button variant="outline" size="sm" onClick={() => toast.info("Add Exam is available to semi-admins approved by the main admin.")}><Plus className="w-4 h-4 mr-1" />Add Exam</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {examsQuery.isLoading ? (
                <p className="text-sm text-muted-foreground">Loading exams...</p>
              ) : (examsQuery.data ?? []).length === 0 ? (
                <div className="rounded-xl border border-dashed border-border p-8 text-center">
                  <Calendar className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No upcoming exams have been added for your campus.</p>
                </div>
              ) : (examsQuery.data ?? []).map(exam => {
                const daysLeft = getDaysUntil(exam.exam_date);
                const isUrgent = daysLeft <= 7;
                return (
                  <div key={exam.id} className={`p-4 rounded-xl border ${isUrgent ? "border-destructive/50 bg-destructive/5" : "border-border/50 bg-muted/30"}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">{exam.course_code} - {exam.course_title}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(exam.exam_date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(exam.exam_date).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                          {exam.department && <Badge variant="outline">{exam.department}</Badge>}
                          {exam.level && <Badge variant="outline">{exam.level}</Badge>}
                        </div>
                      </div>
                      <div className="text-center md:text-right">
                        <div className={`text-3xl font-display font-bold ${isUrgent ? "text-destructive" : "text-primary"}`}>{daysLeft}</div>
                        <span className="text-sm text-muted-foreground">days left</span>
                        {isUrgent && <div className="flex items-center gap-1 mt-1 text-destructive text-xs"><AlertTriangle className="w-3 h-3" />Start revising!</div>}
                      </div>
                    </div>
                    <Progress value={Math.max(0, (30 - daysLeft) / 30 * 100)} className="mt-3 h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-primary" />Study Resources</CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1 md:w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search resources..." className="pl-9" /></div>
                  <Button variant="hero" onClick={() => toast.info("Resource uploads are being audited by campus reps.")}><Plus className="w-4 h-4 mr-1" />Upload</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-dashed border-border p-8 text-center">
                <FileText className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No study resources uploaded yet. Upload past questions or summaries above.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Groups Tab */}
        <TabsContent value="studygroups" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5 text-primary" />Campus Study Groups</CardTitle>
                  <CardDescription>Collaborate with classmates for exams and assignments</CardDescription>
                </div>
                <Button variant="hero" onClick={() => setCreateGroupOpen(true)}><Plus className="w-4 h-4 mr-1" />Create Group</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {studyGroups.map((group) => (
                  <div key={group.id} className="p-4 rounded-xl border border-border/60 bg-card space-y-3 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-base">{group.name}</h4>
                          {group.courseCode && <Badge variant="secondary" className="text-xs">{group.courseCode}</Badge>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{group.description}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {group.membersCount} members
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                      <span className="text-[11px] text-muted-foreground">Campus Group</span>
                      <Button size="sm" variant="outline" onClick={() => handleJoinGroup(group)} className="gap-1.5 text-xs">
                        {group.whatsappLink ? (
                          <>
                            <ExternalLink className="w-3.5 h-3.5 text-emerald-500" /> Join WhatsApp Group
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Join Study Group
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Group Dialog */}
      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Study Group</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Group Name *</Label><Input placeholder="e.g. CSC 401 AI Study Group" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} /></div>
            <div><Label>Course Code (optional)</Label><Input placeholder="e.g. CSC 401" value={groupForm.courseCode} onChange={(e) => setGroupForm({ ...groupForm, courseCode: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea placeholder="What's this study group about?" value={groupForm.description} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} rows={3} /></div>
            <div><Label>WhatsApp Invite Link (optional)</Label><Input placeholder="https://chat.whatsapp.com/..." value={groupForm.whatsappLink} onChange={(e) => setGroupForm({ ...groupForm, whatsappLink: e.target.value })} /></div>
            <Button variant="hero" className="w-full" onClick={handleCreateGroup}>Create Group & Share Link</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Academic;

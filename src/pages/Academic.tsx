import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  GraduationCap, Calculator, Clock, BookOpen, Users, FileText, Download,
  Search, Plus, Calendar, Target, AlertTriangle, Brain, Star, Trash2, ArrowLeft, Link2, Copy, ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

const gradePoints: Record<string, number> = { A: 5.0, B: 4.0, C: 3.0, D: 2.0, E: 1.0, F: 0.0 };

interface Course { id: number; name: string; units: number; grade: string; }

const mockExams = [
  { id: 1, course: "CSC 401 - Database Systems", date: "2026-03-15", time: "9:00 AM", venue: "LT1" },
  { id: 2, course: "CSC 403 - Software Engineering", date: "2026-03-18", time: "2:00 PM", venue: "LT2" },
  { id: 3, course: "MTH 301 - Numerical Analysis", date: "2026-03-22", time: "9:00 AM", venue: "LT3" },
];

const mockResources = [
  { id: 1, title: "CSC 401 Past Questions (2020-2025)", type: "PDF", downloads: 1234, rating: 4.8 },
  { id: 2, title: "Database Systems Complete Notes", type: "PDF", downloads: 890, rating: 4.6 },
  { id: 3, title: "Software Engineering Lecture Slides", type: "PPT", downloads: 567, rating: 4.5 },
  { id: 4, title: "MTH 301 Formula Sheet", type: "PDF", downloads: 2345, rating: 4.9 },
];

const mockStudyGroups = [
  { id: 1, name: "CSC 401 Study Group", members: 45, nextSession: "Tomorrow, 4PM", inviteLink: "https://campushub.ng/group/csc401" },
  { id: 2, name: "Final Year Project Help", members: 23, nextSession: "Friday, 2PM", inviteLink: "https://campushub.ng/group/fyp" },
  { id: 3, name: "MTH 301 Problem Solving", members: 67, nextSession: "Saturday, 10AM", inviteLink: "https://campushub.ng/group/mth301" },
];

const Academic = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([
    { id: 1, name: "CSC 401", units: 3, grade: "A" },
    { id: 2, name: "CSC 403", units: 3, grade: "B" },
    { id: 3, name: "MTH 301", units: 3, grade: "A" },
  ]);
  const [newCourse, setNewCourse] = useState({ name: "", units: "", grade: "A" });
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [groupForm, setGroupForm] = useState({ name: "", description: "", whatsappLink: "" });

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

  const handleDownload = (resource: typeof mockResources[0]) => {
    toast.success(`Downloading ${resource.title}...`);
  };

  const handleJoinGroup = (group: typeof mockStudyGroups[0]) => {
    navigate(`/messages?to=${group.name}&message=Hi! I just joined the group.`);
    toast.success(`Joined ${group.name}!`);
  };

  const handleCreateGroup = () => {
    if (!groupForm.name) { toast.error("Please add a group name"); return; }
    const inviteLink = `https://campushub.ng/group/${groupForm.name.toLowerCase().replace(/\s+/g, '-')}`;
    navigator.clipboard.writeText(inviteLink);
    toast.success("Group created! Invite link copied to clipboard.");
    setCreateGroupOpen(false);
    setGroupForm({ name: "", description: "", whatsappLink: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="w-10 h-10 rounded-xl module-academic border flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
        <div><h1 className="text-2xl font-display font-bold">Academic Tools</h1><p className="text-sm text-muted-foreground">Resources to boost your academic success</p></div>
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
              {mockExams.map(exam => {
                const daysLeft = getDaysUntil(exam.date);
                const isUrgent = daysLeft <= 7;
                return (
                  <div key={exam.id} className={`p-4 rounded-xl border ${isUrgent ? "border-destructive/50 bg-destructive/5" : "border-border/50 bg-muted/30"}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold">{exam.course}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-4 h-4" />{new Date(exam.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}</span>
                          <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{exam.time}</span>
                          <Badge variant="outline">{exam.venue}</Badge>
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
                  <Button variant="hero"><Plus className="w-4 h-4 mr-1" />Upload</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {mockResources.map(resource => (
                  <Card key={resource.id} className="border bg-muted/30 hover:border-primary/30 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><FileText className="w-5 h-5 text-primary" /></div>
                          <div>
                            <h4 className="font-medium text-sm">{resource.title}</h4>
                            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                              <Badge variant="outline">{resource.type}</Badge>
                              <span className="flex items-center gap-1"><Download className="w-3 h-3" />{resource.downloads}</span>
                              <span className="flex items-center gap-1"><Star className="w-3 h-3 text-warning fill-warning" />{resource.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => handleDownload(resource)}><Download className="w-4 h-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Groups Tab */}
        <TabsContent value="studygroups" className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5" />Study Groups</CardTitle>
                <Button variant="hero" onClick={() => setCreateGroupOpen(true)}><Plus className="w-4 h-4 mr-1" />Create Group</Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockStudyGroups.map(group => (
                <Card key={group.id} className="border bg-muted/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Brain className="w-6 h-6 text-primary" /></div>
                        <div>
                          <h4 className="font-semibold">{group.name}</h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><Users className="w-4 h-4" />{group.members} members</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Next: {group.nextSession}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => { navigator.clipboard.writeText(group.inviteLink); toast.success("Invite link copied!"); }}><Copy className="w-4 h-4" /></Button>
                        {group.inviteLink && <Button variant="ghost" size="icon" onClick={() => window.open("https://wa.me", "_blank")}><ExternalLink className="w-4 h-4" /></Button>}
                        <Button variant="outline" onClick={() => handleJoinGroup(group)}>Join Group</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Group Dialog */}
      <Dialog open={createGroupOpen} onOpenChange={setCreateGroupOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Create Study Group</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Group Name *</Label><Input placeholder="e.g., CSC 401 Study Group" value={groupForm.name} onChange={(e) => setGroupForm({ ...groupForm, name: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea placeholder="What's this group about?" value={groupForm.description} onChange={(e) => setGroupForm({ ...groupForm, description: e.target.value })} rows={3} /></div>
            <div><Label>WhatsApp Link (optional)</Label><Input placeholder="https://chat.whatsapp.com/..." value={groupForm.whatsappLink} onChange={(e) => setGroupForm({ ...groupForm, whatsappLink: e.target.value })} /></div>
            <Button variant="hero" className="w-full" onClick={handleCreateGroup}>Create & Copy Invite Link</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Academic;

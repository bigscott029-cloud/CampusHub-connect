import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  FileText,
  Calendar,
  Users,
  Calculator,
  Clock,
  Download,
  Upload,
  Star,
  Search,
  Plus,
} from "lucide-react";
import { Input } from "@/components/ui/input";

const mockResources = [
  {
    id: 1,
    title: "CSC 301 - Data Structures Notes",
    type: "notes",
    downloads: 234,
    rating: 4.8,
    uploader: "TopStudent",
  },
  {
    id: 2,
    title: "MTH 201 Past Questions (2020-2023)",
    type: "past_questions",
    downloads: 567,
    rating: 4.9,
    uploader: "MathWhiz",
  },
  {
    id: 3,
    title: "PHY 101 Lab Manual",
    type: "notes",
    downloads: 189,
    rating: 4.5,
    uploader: "PhysicsProf",
  },
];

const upcomingExams = [
  { id: 1, course: "CSC 301", title: "Data Structures", date: "Feb 15, 2024", daysLeft: 12 },
  { id: 2, course: "MTH 201", title: "Calculus II", date: "Feb 18, 2024", daysLeft: 15 },
  { id: 3, course: "PHY 101", title: "Physics I", date: "Feb 22, 2024", daysLeft: 19 },
];

const Academic = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl module-academic border flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Academic Support</h1>
            <p className="text-sm text-muted-foreground">Resources, tools & study partners</p>
          </div>
        </div>
        <Button variant="hero">
          <Upload className="w-4 h-4" />
          Upload Resource
        </Button>
      </div>

      {/* Quick Tools */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass-card hover-lift cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Calculator className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">GPA Calculator</h3>
          </CardContent>
        </Card>
        <Card className="glass-card hover-lift cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-sm">Exam Countdown</h3>
          </CardContent>
        </Card>
        <Card className="glass-card hover-lift cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold text-sm">Study Partners</h3>
          </CardContent>
        </Card>
        <Card className="glass-card hover-lift cursor-pointer">
          <CardContent className="pt-6 text-center">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold text-sm">Timetable</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Resources Section */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-display">Study Resources</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search resources..." className="pl-10" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="past_questions">Past Questions</TabsTrigger>
                  <TabsTrigger value="textbooks">Textbooks</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-4 space-y-3">
                  {mockResources.map((resource) => (
                    <div
                      key={resource.id}
                      className="flex items-center gap-4 p-4 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm truncate">{resource.title}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-muted-foreground">by {resource.uploader}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-3 h-3 fill-warning text-warning" />
                            <span className="text-xs">{resource.rating}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">{resource.downloads} downloads</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="notes" className="mt-4">
                  <p className="text-muted-foreground text-center py-8">Notes will appear here</p>
                </TabsContent>

                <TabsContent value="past_questions" className="mt-4">
                  <p className="text-muted-foreground text-center py-8">Past questions will appear here</p>
                </TabsContent>

                <TabsContent value="textbooks" className="mt-4">
                  <p className="text-muted-foreground text-center py-8">Textbooks will appear here</p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Exam Countdown */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-display">Upcoming Exams</CardTitle>
              <CardDescription>Stay prepared!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="secondary" className="text-xs mb-1">
                        {exam.course}
                      </Badge>
                      <p className="text-sm font-medium">{exam.title}</p>
                      <p className="text-xs text-muted-foreground">{exam.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">{exam.daysLeft}</p>
                      <p className="text-xs text-muted-foreground">days left</p>
                    </div>
                  </div>
                  <Progress value={100 - (exam.daysLeft / 30) * 100} className="h-1" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Study Groups */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg font-display">Study Groups</CardTitle>
              <CardDescription>Join or create study sessions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2">
                <Plus className="w-4 h-4" />
                Find Study Partners
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Academic;

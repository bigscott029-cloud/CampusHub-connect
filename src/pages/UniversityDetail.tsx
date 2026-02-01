import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  Users,
  Newspaper,
  Ghost,
  Home,
  ShoppingBag,
  GraduationCap,
  Calendar,
  Star,
  TrendingUp,
  Award,
  BookOpen,
  Building2,
  MessageSquare,
} from "lucide-react";

const universityData: Record<string, any> = {
  "demo-university": {
    name: "Demo University",
    location: "Lagos, Nigeria",
    description: "A leading institution known for innovation and academic excellence.",
    students: "15,000+",
    founded: 1990,
    departments: ["Computer Science", "Engineering", "Business", "Arts", "Medicine"],
    features: {
      gists: { count: "12K", trending: ["Exam timetables released!", "New cafeteria opening"] },
      marketplace: { listings: 890, categories: ["Textbooks", "Electronics", "Fashion"] },
      hostels: { listings: 156, avgPrice: "₦350K/year" },
      groups: { count: 45, popular: ["CS 2024", "Medical Students", "Tech Hub"] },
    },
    topPosts: [
      { title: "Library hours extended for exam period", likes: 234 },
      { title: "SUG elections coming up next week", likes: 189 },
      { title: "New parking rules announced", likes: 145 },
    ],
    color: "from-primary to-hostel",
  },
  unilag: {
    name: "University of Lagos",
    location: "Akoka, Lagos",
    description: "Nigeria's foremost university, leading in research and innovation.",
    students: "57,000+",
    founded: 1962,
    departments: ["Engineering", "Law", "Medicine", "Sciences", "Social Sciences", "Arts"],
    features: {
      gists: { count: "89K", trending: ["ASUU update", "Convocation ceremony"] },
      marketplace: { listings: 3200, categories: ["Books", "Gadgets", "Clothing", "Food"] },
      hostels: { listings: 456, avgPrice: "₦450K/year" },
      groups: { count: 234, popular: ["Unilag Connect", "Law Students", "Engineering Hub"] },
    },
    topPosts: [
      { title: "New library building inauguration", likes: 567 },
      { title: "Football team wins intervarsity", likes: 445 },
      { title: "Free WiFi zones expanded", likes: 389 },
    ],
    color: "from-hostel to-primary",
  },
};

const UniversityDetail = () => {
  const { slug } = useParams();
  const uni = universityData[slug || ""] || universityData["demo-university"];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Banner */}
        <section className="pt-20 pb-12 relative overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-br ${uni.color} opacity-10`} />
          <div className="container px-4 relative pt-8">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${uni.color} flex items-center justify-center shrink-0`}>
                <span className="text-primary-foreground font-bold text-4xl">
                  {uni.name.charAt(0)}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-display font-bold">{uni.name}</h1>
                  <Badge variant="secondary">
                    <Award className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {uni.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" /> {uni.students} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" /> Est. {uni.founded}
                  </span>
                </div>
                <p className="text-muted-foreground max-w-2xl">{uni.description}</p>
              </div>
              <Button variant="hero" size="lg" asChild>
                <Link to="/signup">Join Community</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-6 border-y border-border/50 bg-muted/30">
          <div className="container px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Newspaper, value: uni.features.gists.count, label: "Campus Gists" },
                { icon: ShoppingBag, value: uni.features.marketplace.listings, label: "Marketplace Listings" },
                { icon: Home, value: uni.features.hostels.listings, label: "Hostel Listings" },
                { icon: MessageSquare, value: uni.features.groups.count, label: "Active Groups" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-4 rounded-lg bg-card">
                  <stat.icon className="w-6 h-6 mx-auto text-primary mb-2" />
                  <p className="font-display font-bold text-xl">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content Tabs */}
        <section className="py-12">
          <div className="container px-4">
            <Tabs defaultValue="overview" className="space-y-8">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="gists">Trending Gists</TabsTrigger>
                <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
                <TabsTrigger value="hostels">Hostels</TabsTrigger>
                <TabsTrigger value="groups">Groups</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Departments */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" />
                        Departments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {uni.departments.map((dept: string, i: number) => (
                          <Badge key={i} variant="outline">{dept}</Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Trending Posts */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-accent" />
                        Trending Now
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {uni.topPosts.map((post: any, i: number) => (
                        <div key={i} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                          <span className="text-sm">{post.title}</span>
                          <Badge variant="secondary">{post.likes} ❤️</Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Popular Groups */}
                  <Card className="glass-card">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-hostel" />
                        Popular Groups
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {uni.features.groups.popular.map((group: string, i: number) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-border/50 last:border-0">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="w-4 h-4 text-primary" />
                          </div>
                          <span className="text-sm font-medium">{group}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* What Makes Us Unique */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-warning" />
                      What Makes {uni.name} Unique
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <h4 className="font-semibold mb-2">Historic Campus</h4>
                        <p className="text-sm text-muted-foreground">Rich tradition and modern facilities combined</p>
                      </div>
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-xl bg-hostel/10 flex items-center justify-center mx-auto mb-3">
                          <GraduationCap className="w-6 h-6 text-hostel" />
                        </div>
                        <h4 className="font-semibold mb-2">Academic Excellence</h4>
                        <p className="text-sm text-muted-foreground">Top-ranked programs and world-class faculty</p>
                      </div>
                      <div className="text-center p-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                          <Users className="w-6 h-6 text-accent" />
                        </div>
                        <h4 className="font-semibold mb-2">Vibrant Community</h4>
                        <p className="text-sm text-muted-foreground">Active student life and support networks</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="gists">
                <div className="text-center py-12">
                  <Newspaper className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Join to see campus gists</h3>
                  <p className="text-muted-foreground mb-4">Sign up to access trending news and discussions</p>
                  <Button variant="hero" asChild>
                    <Link to="/signup">Sign Up Free</Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="marketplace">
                <div className="text-center py-12">
                  <ShoppingBag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{uni.features.marketplace.listings} active listings</h3>
                  <p className="text-muted-foreground mb-4">Sign up to browse and sell items</p>
                  <Button variant="hero" asChild>
                    <Link to="/signup">Sign Up Free</Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="hostels">
                <div className="text-center py-12">
                  <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{uni.features.hostels.listings} hostel listings</h3>
                  <p className="text-muted-foreground mb-4">Average: {uni.features.hostels.avgPrice}</p>
                  <Button variant="hero" asChild>
                    <Link to="/signup">Sign Up Free</Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="groups">
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{uni.features.groups.count} active groups</h3>
                  <p className="text-muted-foreground mb-4">Join course groups and interest communities</p>
                  <Button variant="hero" asChild>
                    <Link to="/signup">Sign Up Free</Link>
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default UniversityDetail;

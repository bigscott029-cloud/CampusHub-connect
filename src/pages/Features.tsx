import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Newspaper,
  Ghost,
  Home,
  ShoppingBag,
  MessageSquare,
  GraduationCap,
  Bell,
  Shield,
  Zap,
  Users,
  Lock,
  Globe,
  Sparkles,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";

const features = [
  {
    icon: Newspaper,
    title: "Campus Gists & News",
    description: "Stay updated with real-time campus news, trending gists, and official announcements from your university.",
    highlights: ["Real-time updates", "Verified news", "Department feeds"],
    color: "primary",
    gradient: "from-primary to-hostel",
  },
  {
    icon: Ghost,
    title: "Anonymous Zone",
    description: "Express yourself freely with complete anonymity. Share confessions, ask questions, and engage without judgment.",
    highlights: ["Auto-generated aliases", "Safe space", "Moderated content"],
    color: "anonymous",
    gradient: "from-anonymous to-purple-500",
  },
  {
    icon: Home,
    title: "Hostel & Accommodation",
    description: "Find verified hostels, roommates, and accommodation options near your campus with virtual tours.",
    highlights: ["Verified listings", "360° tours", "Roommate matching"],
    color: "hostel",
    gradient: "from-hostel to-primary",
  },
  {
    icon: ShoppingBag,
    title: "Buy & Sell Marketplace",
    description: "Trade textbooks, electronics, and more with fellow students. Safe, local, and student-exclusive.",
    highlights: ["Price negotiation", "Verified sellers", "Local delivery"],
    color: "marketplace",
    gradient: "from-marketplace to-success",
  },
  {
    icon: MessageSquare,
    title: "Messaging & Groups",
    description: "Connect with coursemates, join study groups, and collaborate on projects in real-time.",
    highlights: ["Group chats", "File sharing", "Voice messages"],
    color: "primary",
    gradient: "from-primary to-accent",
  },
  {
    icon: GraduationCap,
    title: "Academic Tools",
    description: "GPA calculator, exam countdown, past questions, and study resources all in one place.",
    highlights: ["GPA tracker", "Study groups", "Resource library"],
    color: "academic",
    gradient: "from-academic to-anonymous",
  },
];

const stats = [
  { icon: Users, value: "50,000+", label: "Active Students" },
  { icon: Globe, value: "25+", label: "Universities" },
  { icon: TrendingUp, value: "1M+", label: "Monthly Posts" },
  { icon: Clock, value: "24/7", label: "Community Support" },
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 gradient-hero-bg opacity-5" />
          <div className="container px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 gradient-bg text-primary-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                All-in-One Campus Platform
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
                Everything You Need for{" "}
                <span className="gradient-text">Campus Life</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                From staying informed to finding accommodation, buying textbooks to connecting with peers - Big Scott brings your entire campus experience into one powerful platform.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/signup">Get Started Free</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/universities">Explore Universities</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 border-y border-border/50 bg-muted/30">
          <div className="container px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="text-2xl md:text-3xl font-display font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Powerful Features for Every Student
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Each module is designed to solve real campus challenges, making your university life easier and more connected.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="glass-card hover-lift group overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${feature.gradient}`} />
                  <CardHeader>
                    <div className={`w-14 h-14 rounded-2xl bg-${feature.color}/10 border border-${feature.color}/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <feature.icon className={`w-7 h-7 text-${feature.color}`} />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{feature.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {feature.highlights.map((highlight, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {highlight}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Security Features */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4" variant="outline">
                  <Shield className="w-3 h-3 mr-1" />
                  Safety First
                </Badge>
                <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                  Built with Your Safety in Mind
                </h2>
                <p className="text-muted-foreground mb-8">
                  We take your privacy and security seriously. From verified university emails to AI-powered moderation, every feature is designed to keep you safe.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Lock, title: "University Email Verification", desc: "Only verified students can join" },
                    { icon: Shield, title: "AI Content Moderation", desc: "Harmful content is automatically flagged" },
                    { icon: Bell, title: "Anonymous Reporting", desc: "Report issues without revealing identity" },
                    { icon: Zap, title: "Real-time Monitoring", desc: "24/7 community safety team" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl gradient-bg opacity-10 absolute inset-0" />
                <div className="relative p-8">
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="glass-card p-4 animate-float" style={{ animationDelay: `${i * 0.5}s` }}>
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-warning" />
                          <span className="text-sm font-medium">Verified Safe</span>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container px-4">
            <Card className="glass-card overflow-hidden">
              <div className="relative p-8 md:p-12 lg:p-16">
                <div className="absolute inset-0 gradient-hero-bg opacity-5" />
                <div className="relative text-center max-w-2xl mx-auto">
                  <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                    Ready to Transform Your Campus Experience?
                  </h2>
                  <p className="text-muted-foreground mb-8">
                    Join thousands of students already using Big Scott to make the most of university life.
                  </p>
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/signup">Sign Up Now - It's Free!</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Features;

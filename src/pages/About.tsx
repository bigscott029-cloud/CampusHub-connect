import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Target,
  Lightbulb,
  Users,
  Shield,
  Zap,
  Globe,
  Award,
  Rocket,
  MessageCircle,
  BookOpen,
  Star,
} from "lucide-react";

const team = [
  { name: "Scott Adams", role: "Founder & CEO", avatar: "S" },
  { name: "Amaka Obi", role: "Head of Product", avatar: "A" },
  { name: "Tunde Bakare", role: "Lead Engineer", avatar: "T" },
  { name: "Fatima Hassan", role: "Community Lead", avatar: "F" },
];

const timeline = [
  { year: "2023", title: "The Idea", desc: "Born from the need for a unified campus experience" },
  { year: "2024", title: "Beta Launch", desc: "First university onboarded with 5,000 students" },
  { year: "2025", title: "Rapid Growth", desc: "Expanded to 25+ universities across Nigeria" },
  { year: "2026", title: "Today", desc: "Serving 100,000+ students with 7 core modules" },
];

const values = [
  {
    icon: Shield,
    title: "Safety First",
    description: "Every feature is built with student safety as the top priority",
    color: "primary",
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Built by students, for students - your feedback shapes our roadmap",
    color: "hostel",
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "Constantly evolving to meet the changing needs of campus life",
    color: "warning",
  },
  {
    icon: Heart,
    title: "Inclusivity",
    description: "A platform where every student feels welcome and heard",
    color: "accent",
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-16 relative overflow-hidden">
          <div className="absolute inset-0 gradient-hero-bg opacity-5" />
          <div className="container px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <Badge className="mb-4 gradient-bg text-primary-foreground">
                <Rocket className="w-3 h-3 mr-1" />
                Our Story
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
                Building the Future of{" "}
                <span className="gradient-text">Campus Life</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                Big Scott started with a simple question: Why isn't there one platform that handles everything students need? From finding hostels to selling textbooks, from anonymous confessions to academic tools - we believed campus life deserved better.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="glass-card p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-4">Our Mission</h2>
                <p className="text-muted-foreground">
                  To simplify and enhance the university experience by providing a single, trusted platform where students can connect, collaborate, and thrive. We aim to solve real campus problems with innovative, student-focused solutions.
                </p>
              </Card>
              <Card className="glass-card p-8">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">
                  <Globe className="w-7 h-7 text-accent" />
                </div>
                <h2 className="text-2xl font-display font-bold mb-4">Our Vision</h2>
                <p className="text-muted-foreground">
                  To become Africa's leading campus media and services platform, empowering every student with the tools, connections, and resources they need to succeed academically and socially throughout their university journey.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">Our Journey</h2>
              <p className="text-muted-foreground">From an idea to impacting 100,000+ students</p>
            </div>
            <div className="max-w-3xl mx-auto">
              <div className="relative">
                <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
                {timeline.map((item, i) => (
                  <div key={i} className="relative pl-20 pb-12 last:pb-0">
                    <div className="absolute left-0 w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">{item.year}</span>
                    </div>
                    <div className="pt-2">
                      <h3 className="text-xl font-display font-bold mb-2">{item.title}</h3>
                      <p className="text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">What We Stand For</h2>
              <p className="text-muted-foreground">The principles that guide everything we build</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, i) => (
                <Card key={i} className="glass-card hover-lift text-center p-6">
                  <div className={`w-14 h-14 rounded-2xl bg-${value.color}/10 flex items-center justify-center mx-auto mb-4`}>
                    <value.icon className={`w-7 h-7 text-${value.color}`} />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">Meet the Team</h2>
              <p className="text-muted-foreground">The people making Big Scott possible</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
              {team.map((member, i) => (
                <Card key={i} className="glass-card text-center p-6">
                  <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-foreground font-bold text-2xl">{member.avatar}</span>
                  </div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "100K+", label: "Students", icon: Users },
                { value: "25+", label: "Universities", icon: BookOpen },
                { value: "1M+", label: "Posts", icon: MessageCircle },
                { value: "4.8/5", label: "Rating", icon: Star },
              ].map((stat, i) => (
                <div key={i}>
                  <stat.icon className="w-8 h-8 mx-auto text-primary mb-3" />
                  <p className="text-3xl font-display font-bold">{stat.value}</p>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container px-4">
            <Card className="glass-card overflow-hidden">
              <CardContent className="p-8 md:p-12 text-center">
                <Award className="w-12 h-12 mx-auto text-primary mb-6" />
                <h2 className="text-3xl font-display font-bold mb-4">Join the Movement</h2>
                <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                  Be part of the platform that's transforming how students experience campus life. Sign up today and see the difference.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/signup">Get Started Free</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/features">Explore Features</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;

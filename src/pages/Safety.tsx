import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Lock,
  Eye,
  AlertTriangle,
  UserX,
  Flag,
  Bot,
  Users,
  CheckCircle2,
  Phone,
  Mail,
  MessageCircle,
  FileWarning,
  ShieldCheck,
  UserCheck,
  Ban,
} from "lucide-react";

const safetyFeatures = [
  {
    icon: Lock,
    title: "University Email Verification",
    description: "Only students with valid university emails can join, ensuring a trusted community.",
  },
  {
    icon: Bot,
    title: "AI Content Moderation",
    description: "Advanced AI automatically detects and flags harmful content before it reaches you.",
  },
  {
    icon: Flag,
    title: "Easy Reporting",
    description: "Report inappropriate content or users with one click. All reports are reviewed within 24 hours.",
  },
  {
    icon: UserX,
    title: "Block & Mute",
    description: "Take control of your experience by blocking or muting users who bother you.",
  },
  {
    icon: Eye,
    title: "Privacy Controls",
    description: "Customize who can see your profile, contact you, or view your activity.",
  },
  {
    icon: ShieldCheck,
    title: "Anonymous Protection",
    description: "Your identity in the Anonymous Zone is completely hidden - even from admins.",
  },
];

const policies = [
  {
    title: "Harassment Policy",
    content: "Zero tolerance for bullying, harassment, threats, or any form of targeted abuse.",
    icon: Ban,
  },
  {
    title: "Content Guidelines",
    content: "No explicit content, hate speech, discrimination, or illegal activities.",
    icon: FileWarning,
  },
  {
    title: "Verification Standards",
    content: "All users must verify their university email. Fake accounts are permanently banned.",
    icon: UserCheck,
  },
];

const Safety = () => {
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
                <Shield className="w-3 h-3 mr-1" />
                Safety First
              </Badge>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
                Your Safety is Our{" "}
                <span className="gradient-text">Top Priority</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                We've built Big Scott with comprehensive safety features to ensure you have a positive, secure experience. Learn about the measures we take to protect our community.
              </p>
            </div>
          </div>
        </section>

        {/* Safety Features Grid */}
        <section className="py-20">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">How We Keep You Safe</h2>
              <p className="text-muted-foreground">Multiple layers of protection working 24/7</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {safetyFeatures.map((feature, i) => (
                <Card key={i} className="glass-card hover-lift">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Moderation Process */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge className="mb-4" variant="outline">
                  <Users className="w-3 h-3 mr-1" />
                  Moderation Team
                </Badge>
                <h2 className="text-3xl font-display font-bold mb-6">
                  Human + AI Moderation
                </h2>
                <p className="text-muted-foreground mb-8">
                  Our hybrid approach combines the speed of AI with the nuance of human judgment. Every university has dedicated moderators who understand local context.
                </p>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "AI First Pass", desc: "Automated scanning catches obvious violations instantly" },
                    { step: "2", title: "Human Review", desc: "Flagged content is reviewed by trained moderators" },
                    { step: "3", title: "Fair Appeals", desc: "Disputed decisions can be appealed and re-reviewed" },
                    { step: "4", title: "Continuous Learning", desc: "Our systems improve based on community feedback" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center shrink-0">
                        <span className="text-primary-foreground font-bold">{item.step}</span>
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
                <Card className="glass-card p-8">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                      <Shield className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-display font-bold">Response Time</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-primary">&lt;1 min</p>
                      <p className="text-sm text-muted-foreground">AI Detection</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-primary">&lt;24 hrs</p>
                      <p className="text-sm text-muted-foreground">Human Review</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-primary">99.9%</p>
                      <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                      <p className="text-2xl font-bold text-primary">24/7</p>
                      <p className="text-sm text-muted-foreground">Monitoring</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Community Policies */}
        <section className="py-20">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">Community Policies</h2>
              <p className="text-muted-foreground">Clear guidelines for a respectful community</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {policies.map((policy, i) => (
                <Card key={i} className="glass-card text-center p-6">
                  <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                    <policy.icon className="w-7 h-7 text-destructive" />
                  </div>
                  <h3 className="font-display font-bold text-lg mb-2">{policy.title}</h3>
                  <p className="text-sm text-muted-foreground">{policy.content}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Anonymous Zone Safety */}
        <section className="py-20 bg-muted/30">
          <div className="container px-4">
            <Card className="glass-card max-w-4xl mx-auto overflow-hidden">
              <div className="h-2 gradient-anonymous" />
              <CardContent className="p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-start gap-8">
                  <div className="w-16 h-16 rounded-2xl gradient-anonymous flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-display font-bold mb-4">Anonymous Zone Safety</h2>
                    <p className="text-muted-foreground mb-6">
                      The Anonymous Zone allows free expression while maintaining safety. Here's how we balance freedom with responsibility:
                    </p>
                    <ul className="space-y-3">
                      {[
                        "Your identity is never revealed, even to moderators",
                        "AI monitors for serious threats and harmful content",
                        "Posts auto-hide after reaching report threshold",
                        "Rate limiting prevents spam and flooding",
                        "Emergency content triggers immediate review",
                      ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Contact Safety Team */}
        <section className="py-20">
          <div className="container px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-display font-bold mb-4">Need Help?</h2>
              <p className="text-muted-foreground">Our safety team is here for you</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {[
                { icon: Mail, title: "Email Us", detail: "safety@bigscott.com", action: "Send Email" },
                { icon: MessageCircle, title: "In-App Report", detail: "Available on every post", action: "Learn How" },
                { icon: Phone, title: "Emergency", detail: "For urgent safety concerns", action: "Contact Now" },
              ].map((item, i) => (
                <Card key={i} className="glass-card text-center p-6">
                  <item.icon className="w-8 h-8 mx-auto text-primary mb-4" />
                  <h3 className="font-semibold mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.detail}</p>
                  <Button variant="outline" size="sm">{item.action}</Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4 text-center">
            <h2 className="text-2xl font-display font-bold mb-4">Join a Safe Community</h2>
            <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
              Experience campus life with peace of mind. Sign up today and be part of a community that prioritizes your safety.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/signup">Get Started Safely</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Safety;

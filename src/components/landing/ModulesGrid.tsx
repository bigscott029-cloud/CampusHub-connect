import { 
  Newspaper, 
  MessageCircle, 
  Home, 
  ShoppingBag, 
  BookOpen,
  Users,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

const modules = [
  {
    icon: Newspaper,
    title: "Campus Gists",
    description: "Stay updated with trending news, events, and announcements from your university.",
    color: "primary",
    bgClass: "module-gists",
    features: ["Trending Posts", "Events", "Department Updates"]
  },
  {
    icon: MessageCircle,
    title: "Anonymous Zone",
    description: "Share confessions, ask questions, and connect without revealing your identity.",
    color: "anonymous",
    bgClass: "module-anonymous",
    features: ["Confessions", "Advice", "Questions"]
  },
  {
    icon: Home,
    title: "Hostel Hub",
    description: "Find verified hostels, roommates, and accommodation near your campus.",
    color: "hostel",
    bgClass: "module-hostel",
    features: ["Verified Listings", "Roommate Finder", "Reviews"]
  },
  {
    icon: ShoppingBag,
    title: "Marketplace",
    description: "Buy and sell safely within your campus community. Trusted transactions only.",
    color: "marketplace",
    bgClass: "module-marketplace",
    features: ["Gadgets", "Books", "Services"]
  },
  {
    icon: BookOpen,
    title: "Academic Tools",
    description: "Access past questions, notes, GPA calculator, and study resources.",
    color: "academic",
    bgClass: "module-academic",
    features: ["Past Questions", "Notes", "GPA Calculator"]
  },
  {
    icon: Users,
    title: "Groups & Chat",
    description: "Connect with coursemates, department groups, and study partners.",
    color: "primary",
    bgClass: "module-gists",
    features: ["Course Groups", "Study Partners", "Direct Messages"]
  }
];

const ModulesGrid = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container px-4">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Everything You Need,
            <span className="gradient-text"> One Platform</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            From daily campus updates to finding a hostel — we've got every aspect of student life covered.
          </p>
        </div>

        {/* Modules grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <div 
              key={module.title}
              className="group glass-card rounded-2xl p-6 hover-lift cursor-pointer animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${module.bgClass} border mb-5`}>
                <module.icon className="w-7 h-7" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-bold mb-2 group-hover:text-primary transition-colors">
                {module.title}
              </h3>
              <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                {module.description}
              </p>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-4">
                {module.features.map((feature) => (
                  <span 
                    key={feature} 
                    className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                  >
                    {feature}
                  </span>
                ))}
              </div>

              {/* Link */}
              <div className="flex items-center text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="hero" size="lg">
            Get Started Free
            <ArrowRight className="ml-2" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ModulesGrid;

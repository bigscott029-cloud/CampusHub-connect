import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Users,
  BookOpen,
  Building2,
  ChevronRight,
  Star,
  TrendingUp,
  Award,
  Globe,
} from "lucide-react";

const universities = [
  {
    id: "demo-uni",
    name: "Demo University",
    slug: "demo-university",
    location: "Lagos, Nigeria",
    students: "15,000+",
    departments: 12,
    activeUsers: "5,234",
    rating: 4.8,
    verified: true,
    features: ["Active marketplace", "Strong community", "24/7 support"],
    color: "from-primary to-hostel",
    stats: { gists: "0", listings: "0", groups: "0" },
  },
  {
    id: "unilag",
    name: "University of Lagos",
    slug: "unilag",
    location: "Akoka, Lagos",
    students: "57,000+",
    departments: 15,
    activeUsers: "23,456",
    rating: 4.9,
    verified: true,
    features: ["Most active", "Top marketplace", "Study groups"],
    color: "from-hostel to-primary",
    stats: { gists: "0", listings: "0", groups: "0" },
  },
  {
    id: "oau",
    name: "Obafemi Awolowo University",
    slug: "oau",
    location: "Ile-Ife, Osun",
    students: "35,000+",
    departments: 13,
    activeUsers: "12,890",
    rating: 4.7,
    verified: true,
    features: ["Beautiful campus", "Active forums", "Events hub"],
    color: "from-academic to-anonymous",
    stats: { gists: "0", listings: "0", groups: "0" },
  },
  {
    id: "ui",
    name: "University of Ibadan",
    slug: "ui",
    location: "Ibadan, Oyo",
    students: "45,000+",
    departments: 14,
    activeUsers: "18,765",
    rating: 4.8,
    verified: true,
    features: ["Research hub", "Alumni network", "Career support"],
    color: "from-marketplace to-success",
    stats: { gists: "0", listings: "0", groups: "0" },
  },
  {
    id: "unn",
    name: "University of Nigeria",
    slug: "unn",
    location: "Nsukka, Enugu",
    students: "40,000+",
    departments: 12,
    activeUsers: "14,567",
    rating: 4.6,
    verified: true,
    features: ["Cultural events", "Sports hub", "Innovation center"],
    color: "from-accent to-warning",
    stats: { gists: "0", listings: "0", groups: "0" },
  },
  {
    id: "abu",
    name: "Ahmadu Bello University",
    slug: "abu",
    location: "Zaria, Kaduna",
    students: "50,000+",
    departments: 15,
    activeUsers: "16,234",
    rating: 4.7,
    verified: true,
    features: ["Tech community", "Startup hub", "Mentorship"],
    color: "from-anonymous to-academic",
    stats: { gists: "58K", listings: "2.3K", groups: "312" },
  },
];

const Universities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");

  const filteredUniversities = universities.filter((uni) =>
    uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    uni.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        {/* Hero Section */}
        <section className="pt-24 pb-12 relative overflow-hidden">
          <div className="absolute inset-0 gradient-hero-bg opacity-5" />
          <div className="container px-4 relative">
            <div className="text-center max-w-3xl mx-auto">
              <Badge className="mb-4 gradient-bg text-primary-foreground">
                <Building2 className="w-3 h-3 mr-1" />
                25+ Universities & Growing
              </Badge>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-6">
                Find Your <span className="gradient-text">University</span>
              </h1>
              <p className="text-lg text-muted-foreground mb-8">
                Join your campus community and connect with fellow students. Each university has its own unique features and active community.
              </p>

              {/* Search */}
              <div className="max-w-lg mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search for your university..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 text-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Quick Stats */}
        <section className="py-8 border-y border-border/50 bg-muted/30">
          <div className="container px-4">
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              {[
                { icon: Globe, value: "25+", label: "Universities" },
                { icon: Users, value: "100K+", label: "Students" },
                { icon: TrendingUp, value: "50K+", label: "Daily Active" },
              ].map((stat, i) => (
                <div key={i} className="flex items-center gap-3">
                  <stat.icon className="w-5 h-5 text-primary" />
                  <span className="font-display font-bold text-xl">{stat.value}</span>
                  <span className="text-muted-foreground">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Universities Grid */}
        <section className="py-16">
          <div className="container px-4">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredUniversities.map((uni) => (
                <Card key={uni.id} className="glass-card hover-lift overflow-hidden group">
                  <div className={`h-2 bg-gradient-to-r ${uni.color}`} />
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${uni.color} flex items-center justify-center`}>
                          <span className="text-primary-foreground font-bold text-xl">
                            {uni.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg leading-tight">
                            {uni.name}
                          </h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="w-3 h-3" />
                            {uni.location}
                          </div>
                        </div>
                      </div>
                      {uni.verified && (
                        <Badge variant="secondary" className="shrink-0">
                          <Award className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 mb-4 p-3 rounded-lg bg-muted/50">
                      <div className="text-center">
                        <p className="font-bold text-lg">{uni.stats.gists}</p>
                        <p className="text-xs text-muted-foreground">Gists</p>
                      </div>
                      <div className="text-center border-x border-border/50">
                        <p className="font-bold text-lg">{uni.stats.listings}</p>
                        <p className="text-xs text-muted-foreground">Listings</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-lg">{uni.stats.groups}</p>
                        <p className="text-xs text-muted-foreground">Groups</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {uni.features.map((feature, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-warning fill-warning" />
                          <span className="font-semibold">{uni.rating}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          • {uni.activeUsers} active
                        </span>
                      </div>
                      <Button variant="ghost" size="sm" className="group-hover:translate-x-1 transition-transform" asChild>
                        <Link to={`/university/${uni.slug}`}>
                          Explore <ChevronRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredUniversities.length === 0 && (
              <div className="text-center py-12">
                <Building2 className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No universities found</h3>
                <p className="text-muted-foreground">
                  Try a different search term or{" "}
                  <Button variant="link" className="px-1">request your university</Button>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Request University CTA */}
        <section className="py-16 bg-muted/30">
          <div className="container px-4">
            <Card className="glass-card max-w-2xl mx-auto text-center p-8">
              <h2 className="text-2xl font-display font-bold mb-3">
                Don't See Your University?
              </h2>
              <p className="text-muted-foreground mb-6">
                We're constantly expanding! Request your university and be the first to bring Big Scott to your campus.
              </p>
              <Button variant="hero">Request Your University</Button>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Universities;

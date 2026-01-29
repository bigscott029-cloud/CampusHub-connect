import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Home,
  Search,
  MapPin,
  Wifi,
  Car,
  Shield,
  Star,
  Heart,
  Filter,
  Plus,
  Users,
  Building,
} from "lucide-react";

const mockListings = [
  {
    id: 1,
    title: "Spacious Self-Contain Near Campus Gate",
    type: "hostel",
    price: "₦150,000/year",
    location: "Off Campus - Main Gate Area",
    facilities: ["wifi", "security", "water"],
    rating: 4.5,
    reviews: 23,
    image: "/placeholder.svg",
    verified: true,
  },
  {
    id: 2,
    title: "Looking for Female Roommate",
    type: "roommate",
    price: "₦75,000/year (shared)",
    location: "Block B, Campus Hostels",
    description: "Clean, quiet, and studious. Looking for like-minded roommate.",
    postedBy: "Sarah M.",
  },
  {
    id: 3,
    title: "Modern Studio Apartment",
    type: "hostel",
    price: "₦200,000/year",
    location: "5 mins walk from campus",
    facilities: ["wifi", "parking", "security", "generator"],
    rating: 4.8,
    reviews: 45,
    image: "/placeholder.svg",
    verified: true,
  },
];

const Hostel = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl module-hostel border flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Hostel Hub</h1>
            <p className="text-sm text-muted-foreground">Find your perfect campus accommodation</p>
          </div>
        </div>
        <Button variant="hero">
          <Plus className="w-4 h-4" />
          Add Listing
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="glass-card">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by location, price, or facilities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" className="gap-1">
            <Building className="w-4 h-4" />
            All Listings
          </TabsTrigger>
          <TabsTrigger value="hostels" className="gap-1">
            <Home className="w-4 h-4" />
            Hostels
          </TabsTrigger>
          <TabsTrigger value="roommates" className="gap-1">
            <Users className="w-4 h-4" />
            Roommates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockListings.map((listing) => (
              <Card key={listing.id} className="glass-card hover-lift overflow-hidden">
                {listing.image && (
                  <div className="h-40 bg-muted relative">
                    <img
                      src={listing.image}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    {listing.verified && (
                      <Badge className="absolute top-2 left-2 bg-primary">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base font-semibold line-clamp-2">
                      {listing.title}
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {listing.location}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-lg font-bold text-primary">{listing.price}</p>
                  
                  {listing.facilities && (
                    <div className="flex gap-2 mt-3">
                      {listing.facilities.includes("wifi") && (
                        <div className="p-1.5 rounded bg-muted" title="WiFi">
                          <Wifi className="w-3 h-3" />
                        </div>
                      )}
                      {listing.facilities.includes("parking") && (
                        <div className="p-1.5 rounded bg-muted" title="Parking">
                          <Car className="w-3 h-3" />
                        </div>
                      )}
                      {listing.facilities.includes("security") && (
                        <div className="p-1.5 rounded bg-muted" title="Security">
                          <Shield className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  )}

                  {listing.rating && (
                    <div className="flex items-center gap-1 mt-3 text-sm">
                      <Star className="w-4 h-4 fill-warning text-warning" />
                      <span className="font-medium">{listing.rating}</span>
                      <span className="text-muted-foreground">({listing.reviews} reviews)</span>
                    </div>
                  )}

                  {listing.description && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {listing.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hostels" className="mt-4">
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">Hostel listings will appear here</p>
          </Card>
        </TabsContent>

        <TabsContent value="roommates" className="mt-4">
          <Card className="glass-card p-8 text-center">
            <p className="text-muted-foreground">Roommate requests will appear here</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Hostel;

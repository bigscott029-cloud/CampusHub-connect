import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import {
  Home,
  Search,
  Filter,
  MapPin,
  Star,
  Heart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Wifi,
  Zap,
  Droplets,
  Shield,
  Car,
  Plus,
  Eye,
  Verified,
  Camera,
  Phone,
} from "lucide-react";

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  power: Zap,
  water: Droplets,
  security: Shield,
  parking: Car,
};

const mockHostels = [
  {
    id: 1,
    title: "Spacious Self-Contain Near Campus Gate",
    type: "Self-Contain",
    price: 350000,
    location: "Campus Gate Area",
    distance: "2 min walk",
    images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
    amenities: ["wifi", "power", "water", "security"],
    rating: 4.8,
    reviews: 24,
    views: 456,
    verified: true,
    available: true,
    landlord: "Mrs. Johnson",
    postedDays: 2,
  },
  {
    id: 2,
    title: "2-Bedroom Flat - Fully Furnished",
    type: "Flat",
    price: 550000,
    location: "Off Campus Road",
    distance: "5 min walk",
    images: ["/placeholder.svg", "/placeholder.svg"],
    amenities: ["wifi", "power", "water", "security", "parking"],
    rating: 4.5,
    reviews: 18,
    views: 234,
    verified: true,
    available: true,
    landlord: "Mr. Adeyemi",
    postedDays: 5,
  },
  {
    id: 3,
    title: "Single Room in Shared Apartment",
    type: "Single Room",
    price: 180000,
    location: "Student Village",
    distance: "10 min walk",
    images: ["/placeholder.svg"],
    amenities: ["wifi", "power", "water"],
    rating: 4.2,
    reviews: 12,
    views: 189,
    verified: false,
    available: true,
    landlord: "David O.",
    postedDays: 1,
  },
];

const mockRoommateRequests = [
  {
    id: 1,
    name: "Tunde A.",
    gender: "Male",
    level: "400L",
    department: "Computer Science",
    budget: "200K - 300K",
    preferences: ["Non-smoker", "Quiet", "Clean"],
    avatar: "T",
  },
  {
    id: 2,
    name: "Amaka O.",
    gender: "Female",
    level: "300L",
    department: "Medicine",
    budget: "250K - 400K",
    preferences: ["Early riser", "Studious", "Friendly"],
    avatar: "A",
  },
];

const Hostel = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([100000, 600000]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<number, number>>({});

  const toggleFavorite = (id: number) => {
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const nextImage = (hostelId: number, maxImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [hostelId]: ((prev[hostelId] || 0) + 1) % maxImages
    }));
  };

  const prevImage = (hostelId: number, maxImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [hostelId]: ((prev[hostelId] || 0) - 1 + maxImages) % maxImages
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl module-hostel border flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Hostel Hub</h1>
            <p className="text-sm text-muted-foreground">Find your perfect accommodation</p>
          </div>
        </div>
        <Button variant="hero">
          <Plus className="w-4 h-4 mr-1" />
          List Your Space
        </Button>
      </div>

      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="listings" className="gap-1">
            <Home className="w-4 h-4" />
            Hostel Listings
          </TabsTrigger>
          <TabsTrigger value="roommates" className="gap-1">
            <Users className="w-4 h-4" />
            Find Roommates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-6">
          {/* Search & Filters */}
          <Card className="glass-card">
            <CardContent className="py-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by location, type..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground whitespace-nowrap">Price:</span>
                    <span className="text-sm font-medium">
                      ₦{(priceRange[0] / 1000).toFixed(0)}K - ₦{(priceRange[1] / 1000).toFixed(0)}K
                    </span>
                  </div>
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={1000000}
                    min={50000}
                    step={10000}
                    className="w-40"
                  />
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Listings Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockHostels.map((hostel) => (
              <Card key={hostel.id} className="glass-card overflow-hidden hover-lift group">
                {/* Image Carousel */}
                <div className="relative aspect-[4/3] bg-muted">
                  <img
                    src={hostel.images[currentImageIndex[hostel.id] || 0]}
                    alt={hostel.title}
                    className="w-full h-full object-cover"
                  />
                  {hostel.images.length > 1 && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => prevImage(hostel.id, hostel.images.length)}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => nextImage(hostel.id, hostel.images.length)}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                        {hostel.images.map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i === (currentImageIndex[hostel.id] || 0)
                                ? "bg-primary"
                                : "bg-primary/30"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-2">
                    {hostel.verified && (
                      <Badge className="bg-success text-success-foreground">
                        <Verified className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                    <Badge variant="secondary">
                      <Camera className="w-3 h-3 mr-1" />
                      {hostel.images.length}
                    </Badge>
                  </div>
                  {/* Favorite Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 bg-background/80 h-8 w-8"
                    onClick={() => toggleFavorite(hostel.id)}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(hostel.id) ? "fill-destructive text-destructive" : ""}`} />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <Badge variant="outline">{hostel.type}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-warning fill-warning" />
                      <span className="font-semibold text-sm">{hostel.rating}</span>
                      <span className="text-xs text-muted-foreground">({hostel.reviews})</span>
                    </div>
                  </div>

                  <h3 className="font-semibold text-sm line-clamp-2 mb-2">{hostel.title}</h3>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span>{hostel.location}</span>
                    <span>•</span>
                    <span>{hostel.distance}</span>
                  </div>

                  {/* Amenities */}
                  <div className="flex gap-2 mb-4">
                    {hostel.amenities.slice(0, 4).map((amenity) => {
                      const Icon = amenityIcons[amenity];
                      return (
                        <div key={amenity} className="w-8 h-8 rounded-md bg-muted flex items-center justify-center" title={amenity}>
                          <Icon className="w-4 h-4 text-muted-foreground" />
                        </div>
                      );
                    })}
                    {hostel.amenities.length > 4 && (
                      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-xs font-medium">
                        +{hostel.amenities.length - 4}
                      </div>
                    )}
                  </div>

                  {/* Price & Actions */}
                  <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div>
                      <p className="text-xl font-bold text-primary">
                        ₦{(hostel.price / 1000).toFixed(0)}K
                        <span className="text-sm font-normal text-muted-foreground">/year</span>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {hostel.views} views
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button variant="hero" size="sm">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Contact
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Roommates Tab */}
        <TabsContent value="roommates" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Looking for Roommates</h2>
            <Button variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Post Request
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockRoommateRequests.map((request) => (
              <Card key={request.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-full gradient-bg flex items-center justify-center">
                      <span className="text-xl font-bold text-primary-foreground">{request.avatar}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{request.name}</h3>
                      <p className="text-sm text-muted-foreground">{request.level} • {request.department}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Gender</span>
                      <Badge variant="outline">{request.gender}</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Budget</span>
                      <span className="font-medium">₦{request.budget}</span>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Preferences:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {request.preferences.map((pref, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">{pref}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button variant="hero" className="w-full mt-4">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Send Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Hostel;

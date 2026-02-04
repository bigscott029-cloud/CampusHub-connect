import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  MapPin,
  Star,
  Heart,
  MessageCircle,
  Phone,
  ChevronLeft,
  ChevronRight,
  Wifi,
  Zap,
  Droplets,
  Shield,
  Car,
  Eye,
  Verified,
  Share2,
  Flag,
} from "lucide-react";

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  power: Zap,
  water: Droplets,
  security: Shield,
  parking: Car,
};

const amenityLabels: Record<string, string> = {
  wifi: "WiFi Available",
  power: "24/7 Power Supply",
  water: "Running Water",
  security: "Security",
  parking: "Parking Space",
};

// Mock hostel data - in production this would come from DB
const mockHostel = {
  id: 1,
  title: "Spacious Self-Contain Near Campus Gate",
  description: "A beautiful, well-ventilated self-contain apartment located just 2 minutes walk from the main campus gate. Perfect for students who want convenience and comfort. The room is newly renovated with modern tiles and fixtures. Water supply is constant and there's 24/7 security patrol in the compound.",
  type: "Self-Contain",
  price: 350000,
  location: "Campus Gate Area",
  address: "12 University Road, Near Main Gate",
  distance: "2 min walk",
  images: ["/placeholder.svg", "/placeholder.svg", "/placeholder.svg"],
  amenities: ["wifi", "power", "water", "security"],
  rating: 4.8,
  reviews: 24,
  views: 456,
  verified: true,
  available: true,
  landlord: {
    name: "Mrs. Johnson",
    phone: "+234 801 234 5678",
    avatar: "J",
    verified: true,
  },
  postedDays: 2,
  rules: [
    "No loud music after 10 PM",
    "Visitors allowed until 9 PM",
    "Keep environment clean",
    "No pets allowed",
  ],
};

const HostelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % mockHostel.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + mockHostel.images.length) % mockHostel.images.length);
  };

  const handleContact = () => {
    // Navigate to messages with pre-filled message
    navigate(`/messages?to=${mockHostel.landlord.name}&ref=hostel:${id}&message=Hi, I'm interested in your hostel listing: "${mockHostel.title}"`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-display font-bold line-clamp-1">{mockHostel.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{mockHostel.location}</span>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)}>
          <Heart className={`w-5 h-5 ${isFavorite ? "fill-destructive text-destructive" : ""}`} />
        </Button>
        <Button variant="ghost" size="icon">
          <Share2 className="w-5 h-5" />
        </Button>
      </div>

      {/* Image Gallery */}
      <div className="relative aspect-video rounded-xl overflow-hidden bg-muted">
        <img
          src={mockHostel.images[currentImageIndex]}
          alt={mockHostel.title}
          className="w-full h-full object-cover"
        />
        {mockHostel.images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80"
              onClick={prevImage}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80"
              onClick={nextImage}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {mockHostel.images.map((_, i) => (
                <button
                  key={i}
                  className={`w-2 h-2 rounded-full ${i === currentImageIndex ? "bg-primary" : "bg-primary/30"}`}
                  onClick={() => setCurrentImageIndex(i)}
                />
              ))}
            </div>
          </>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          {mockHostel.verified && (
            <Badge className="bg-success text-success-foreground">
              <Verified className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
          <Badge variant="secondary">{mockHostel.type}</Badge>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Price & Stats */}
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    ₦{(mockHostel.price / 1000).toFixed(0)}K
                    <span className="text-base font-normal text-muted-foreground">/year</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Posted {mockHostel.postedDays} days ago</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-5 h-5 text-warning fill-warning" />
                    <span className="font-semibold">{mockHostel.rating}</span>
                    <span className="text-muted-foreground">({mockHostel.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    {mockHostel.views} views
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{mockHostel.description}</p>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Amenities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {mockHostel.amenities.map((amenity) => {
                  const Icon = amenityIcons[amenity];
                  return (
                    <div key={amenity} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <Icon className="w-5 h-5 text-primary" />
                      <span className="text-sm font-medium">{amenityLabels[amenity]}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* House Rules */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">House Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {mockHostel.rules.map((rule, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    {rule}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Location */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{mockHostel.address}</p>
                  <p className="text-sm text-muted-foreground">{mockHostel.distance} from campus</p>
                </div>
              </div>
              <div className="mt-4 aspect-video rounded-lg bg-muted flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Map view coming soon</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Landlord Card */}
          <Card className="glass-card sticky top-6">
            <CardHeader>
              <CardTitle className="text-lg">Contact Agent</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">
                    {mockHostel.landlord.avatar}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold">{mockHostel.landlord.name}</p>
                    {mockHostel.landlord.verified && (
                      <Verified className="w-4 h-4 text-primary fill-primary" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Verified Agent</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" variant="hero" onClick={handleContact}>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Contact Agent
                </Button>
                <Button className="w-full" variant="outline" onClick={() => setPhoneDialogOpen(true)}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Agent
                </Button>
              </div>

              <Button variant="ghost" className="w-full text-muted-foreground" size="sm">
                <Flag className="w-4 h-4 mr-2" />
                Report Listing
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Phone Dialog */}
      <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Contact {mockHostel.landlord.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-muted/50 text-center">
              <p className="text-2xl font-mono font-bold">{mockHostel.landlord.phone}</p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => window.open(`tel:${mockHostel.landlord.phone}`)}>
                <Phone className="w-4 h-4 mr-2" />
                Dial Now
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(mockHostel.landlord.phone)}>
                Copy Number
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HostelDetail;

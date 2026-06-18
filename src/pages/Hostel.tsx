/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Camera,
  Car,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Eye,
  Filter,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Shield,
  Star,
  Users,
  Verified,
  Wifi,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import InlineAdCard from "@/components/ads/InlineAdCard";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  power: Zap,
  water: Droplets,
  security: Shield,
  parking: Car,
};

interface HostelListing {
  id: string;
  title: string;
  type: string;
  price: number;
  pricePeriod: string;
  location: string;
  images: string[];
  amenities: string[];
  rating: number;
  reviews: number;
  views: number;
  verified: boolean;
  landlord: { id: string; name: string; phone: string };
}

interface RoommateRequest {
  id: string;
  name: string;
  budget: string;
  preferences: string[];
  avatar: string;
  title: string;
  location: string;
}

const placeholderImage = "/placeholder.svg";

const Hostel = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([100000, 600000]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<Record<string, number>>({});
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [selectedPhone, setSelectedPhone] = useState({ name: "", phone: "" });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: "all",
    amenities: [] as string[],
    verified: false,
  });

  const hostelsQuery = useQuery({
    queryKey: ["hostel-listings"],
    queryFn: async (): Promise<HostelListing[]> => {
      const { data: listings, error } = await (supabase as any)
        .from("hostel_listings")
        .select("id, user_id, title, price, price_period, location, hostel_type, amenities, images, phone_number, views_count, is_verified")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = Array.from(new Set((listings ?? []).map((listing: any) => listing.user_id)));
      const { data: profiles } = userIds.length
        ? await (supabase as any).from("profiles").select("user_id, display_name, verified_badge").in("user_id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles ?? []).map((profile: any) => [profile.user_id, profile]));

      return (listings ?? []).map((listing: any) => {
        const profile = profileMap.get(listing.user_id);
        const landlordName = profile?.display_name || "Campus Agent";
        const images = listing.images?.length ? listing.images : [placeholderImage];

        return {
          id: listing.id,
          title: listing.title,
          type: listing.hostel_type,
          price: Number(listing.price ?? 0),
          pricePeriod: listing.price_period || "yearly",
          location: listing.location,
          images,
          amenities: listing.amenities ?? [],
          rating: 0,
          reviews: 0,
          views: listing.views_count ?? 0,
          verified: Boolean(listing.is_verified || profile?.verified_badge),
          landlord: {
            id: listing.user_id,
            name: landlordName,
            phone: listing.phone_number || "",
          },
        };
      });
    },
  });

  const roommateQuery = useQuery({
    queryKey: ["roommate-requests"],
    queryFn: async (): Promise<RoommateRequest[]> => {
      const { data: requests, error } = await supabase
        .from("roommate_requests")
        .select("id, user_id, title, budget_min, budget_max, preferred_location, preferences")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = Array.from(new Set((requests ?? []).map((request) => request.user_id)));
      const { data: profiles } = userIds.length
        ? await (supabase as any).from("profiles").select("user_id, display_name").in("user_id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles ?? []).map((profile: any) => [profile.user_id, profile]));

      return (requests ?? []).map((request) => {
        const name = profileMap.get(request.user_id)?.display_name || "Campus Member";
        return {
          id: request.id,
          name,
          title: request.title,
          location: request.preferred_location || "Flexible",
          budget: [request.budget_min, request.budget_max].filter(Boolean).map((value) => formatCurrency(Number(value))).join(" - ") || "Open budget",
          preferences: request.preferences ? request.preferences.split(",").map((item) => item.trim()).filter(Boolean) : [],
          avatar: name.charAt(0).toUpperCase(),
        };
      });
    },
  });

  const filteredHostels = useMemo(() => {
    return (hostelsQuery.data ?? []).filter((hostel) => {
      const matchesSearch = `${hostel.title} ${hostel.location} ${hostel.type}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = hostel.price >= priceRange[0] && hostel.price <= priceRange[1];
      const matchesType = filters.type === "all" || hostel.type === filters.type;
      const matchesVerified = !filters.verified || hostel.verified;
      const matchesAmenities = filters.amenities.length === 0 || filters.amenities.every((amenity) => hostel.amenities.includes(amenity));
      return matchesSearch && matchesPrice && matchesType && matchesVerified && matchesAmenities;
    });
  }, [filters, hostelsQuery.data, priceRange, searchQuery]);

  const toggleFavorite = (id: string) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const nextImage = (hostelId: string, maxImages: number) => {
    setCurrentImageIndex((current) => ({ ...current, [hostelId]: ((current[hostelId] || 0) + 1) % maxImages }));
  };

  const prevImage = (hostelId: string, maxImages: number) => {
    setCurrentImageIndex((current) => ({ ...current, [hostelId]: ((current[hostelId] || 0) - 1 + maxImages) % maxImages }));
  };

  const handleCall = (landlord: { name: string; phone: string }) => {
    setSelectedPhone(landlord);
    setPhoneDialogOpen(true);
  };

  const handleContact = (hostel: HostelListing) => {
    navigate(`/messages?to=${hostel.landlord.id}&ref=hostel:${hostel.id}&message=Hi, I'm interested in your listing: "${hostel.title}"`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border module-hostel">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Hostel Hub</h1>
            <p className="text-sm text-muted-foreground">Find your perfect accommodation</p>
          </div>
        </div>
        <Button variant="hero" onClick={() => navigate("/hostel/create")}>
          <Plus className="mr-1 h-4 w-4" />List Your Space
        </Button>
      </div>

      <Tabs defaultValue="listings" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="listings" className="gap-1"><Home className="h-4 w-4" />Hostel Listings</TabsTrigger>
          <TabsTrigger value="roommates" className="gap-1"><Users className="h-4 w-4" />Find Roommates</TabsTrigger>
        </TabsList>

        <TabsContent value="listings" className="space-y-6">
          <Card className="glass-card">
            <CardContent className="py-4">
              <div className="flex flex-col gap-4 lg:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search by location, type..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-10" />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <span className="text-sm font-medium">{formatCurrency(priceRange[0])} - {formatCurrency(priceRange[1])}</span>
                  <Slider value={priceRange} onValueChange={setPriceRange} max={1000000} min={50000} step={10000} className="w-40" />
                  <Button variant="outline" className="gap-2" onClick={() => setFiltersOpen(true)}>
                    <Filter className="h-4 w-4" />More Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredHostels.map((hostel, index) => (
              <div key={hostel.id} className="contents">
              {index > 0 && index % 6 === 0 && <InlineAdCard placement="hostel" />}
              <Card className="glass-card hover-lift group cursor-pointer overflow-hidden" onClick={() => navigate(`/hostel/${hostel.id}`)}>
                <div className="relative aspect-[4/3] bg-muted" onClick={(event) => event.stopPropagation()}>
                  <img src={hostel.images[currentImageIndex[hostel.id] || 0]} alt={hostel.title} className="h-full w-full object-cover" />
                  {hostel.images.length > 1 && (
                    <>
                      <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 h-8 w-8 -translate-y-1/2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100" onClick={(event) => { event.stopPropagation(); prevImage(hostel.id, hostel.images.length); }}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 h-8 w-8 -translate-y-1/2 bg-background/80 opacity-0 transition-opacity group-hover:opacity-100" onClick={(event) => { event.stopPropagation(); nextImage(hostel.id, hostel.images.length); }}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                  <div className="absolute left-2 top-2 flex gap-2">
                    {hostel.verified && <Badge className="bg-success text-success-foreground"><Verified className="mr-1 h-3 w-3" />Verified</Badge>}
                    <Badge variant="secondary"><Camera className="mr-1 h-3 w-3" />{hostel.images.length}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 bg-background/80" onClick={(event) => { event.stopPropagation(); toggleFavorite(hostel.id); }}>
                    <Heart className={`h-4 w-4 ${favorites.includes(hostel.id) ? "fill-destructive text-destructive" : ""}`} />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <Badge variant="outline">{hostel.type}</Badge>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-warning" />
                      <span className="text-sm font-semibold">{hostel.rating || "New"}</span>
                    </div>
                  </div>
                  <h3 className="mb-2 line-clamp-2 text-sm font-semibold">{hostel.title}</h3>
                  <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 shrink-0" /><span>{hostel.location}</span>
                  </div>
                  <div className="mb-4 flex gap-2">
                    {hostel.amenities.slice(0, 4).map((amenity) => {
                      const Icon = amenityIcons[amenity] || Home;
                      return (
                        <div key={amenity} className="flex h-8 w-8 items-center justify-center rounded-md bg-muted" title={amenity}>
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between border-t border-border/50 pt-3" onClick={(event) => event.stopPropagation()}>
                    <div>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(hostel.price)}
                        <span className="text-sm font-normal text-muted-foreground">/{hostel.pricePeriod}</span>
                      </p>
                      <p className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3 w-3" />{hostel.views} views</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" disabled={!hostel.landlord.phone} onClick={() => handleCall(hostel.landlord)}><Phone className="h-4 w-4" /></Button>
                      <Button variant="hero" size="sm" onClick={() => handleContact(hostel)}><MessageCircle className="mr-1 h-4 w-4" />Contact</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              </div>
            ))}
          </div>

          {!hostelsQuery.isLoading && filteredHostels.length === 0 && (
            <Card className="glass-card p-8 text-center text-sm text-muted-foreground">No approved hostel listings match your filters.</Card>
          )}
        </TabsContent>

        <TabsContent value="roommates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Looking for Roommates</h2>
            <Button variant="outline" onClick={() => navigate("/hostel/roommate")}><Plus className="mr-1 h-4 w-4" />Post Request</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {(roommateQuery.data ?? []).map((request) => (
              <Card key={request.id} className="glass-card">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full gradient-bg">
                      <span className="text-xl font-bold text-primary-foreground">{request.avatar}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold">{request.name}</h3>
                      <p className="text-sm text-muted-foreground">{request.title}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Location</span><Badge variant="outline">{request.location}</Badge></div>
                    <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Budget</span><span className="font-medium">{request.budget}</span></div>
                    <div>
                      <span className="text-sm text-muted-foreground">Preferences:</span>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {(request.preferences.length ? request.preferences : ["Open"]).map((pref) => <Badge key={pref} variant="secondary" className="text-xs">{pref}</Badge>)}
                      </div>
                    </div>
                  </div>
                  <Button variant="hero" className="mt-4 w-full" onClick={() => navigate(`/messages?message=Hi, I saw your roommate request and I'm interested!`)}>
                    <MessageCircle className="mr-1 h-4 w-4" />Send Message
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Contact {selectedPhone.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center">
              <p className="text-2xl font-bold">{selectedPhone.phone || "No phone provided"}</p>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1" disabled={!selectedPhone.phone} onClick={() => window.open(`tel:${selectedPhone.phone}`)}><Phone className="mr-2 h-4 w-4" />Dial Now</Button>
              <Button variant="outline" className="flex-1" disabled={!selectedPhone.phone} onClick={() => navigator.clipboard.writeText(selectedPhone.phone)}>Copy Number</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={filtersOpen} onOpenChange={setFiltersOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Filter Listings</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div>
              <Label>Accommodation Type</Label>
              <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                <SelectTrigger><SelectValue placeholder="All types" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="Self-Contain">Self-Contain</SelectItem>
                  <SelectItem value="Single Room">Single Room</SelectItem>
                  <SelectItem value="Flat">Flat</SelectItem>
                  <SelectItem value="Shared Room">Shared Room</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="mb-3 block">Amenities</Label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(amenityIcons).map(([key, Icon]) => (
                  <label key={key} className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 ${filters.amenities.includes(key) ? "border-primary bg-primary/5" : "border-border"}`}>
                    <Checkbox checked={filters.amenities.includes(key)} onCheckedChange={(checked) => setFilters({ ...filters, amenities: checked ? [...filters.amenities, key] : filters.amenities.filter((amenity) => amenity !== key) })} />
                    <Icon className="h-4 w-4" />
                    <span className="text-sm capitalize">{key}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="flex items-center gap-2">
              <Checkbox checked={filters.verified} onCheckedChange={(checked) => setFilters({ ...filters, verified: Boolean(checked) })} />
              <span className="text-sm">Verified listings only</span>
            </label>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setFilters({ type: "all", amenities: [], verified: false })}>Clear All</Button>
              <Button className="flex-1" onClick={() => setFiltersOpen(false)}>Apply Filters</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Hostel;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  Car,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Eye,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  Share2,
  Shield,
  Star,
  Verified,
  Wifi,
  Zap,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";
import { toast } from "sonner";

const amenityIcons: Record<string, any> = {
  wifi: Wifi,
  power: Zap,
  water: Droplets,
  security: Shield,
  parking: Car,
};

const amenityLabels: Record<string, string> = {
  wifi: "WiFi Available",
  power: "Power Supply",
  water: "Running Water",
  security: "Security",
  parking: "Parking Space",
};

const placeholderImage = "/placeholder.svg";

const HostelDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const hostelQuery = useQuery({
    queryKey: ["hostel-detail", id],
    enabled: Boolean(id),
    queryFn: async () => {
      const { data: hostel, error } = await (supabase as any)
        .from("hostel_listings")
        .select("id, user_id, title, description, price, price_period, location, hostel_type, amenities, images, phone_number, created_at, views_count, is_verified")
        .eq("id", id)
        .maybeSingle();

      if (error) throw error;
      if (!hostel) throw new Error("Hostel listing not found.");

      const { data: profile } = await (supabase as any)
        .from("profiles")
        .select("display_name, avatar_url, verified_badge")
        .eq("user_id", hostel.user_id)
        .maybeSingle();

      const landlordName = profile?.display_name || "Campus Agent";

      return {
        id: hostel.id,
        userId: hostel.user_id,
        title: hostel.title,
        description: hostel.description || "No description provided.",
        type: hostel.hostel_type,
        price: Number(hostel.price ?? 0),
        pricePeriod: hostel.price_period || "yearly",
        location: hostel.location,
        images: hostel.images?.length ? hostel.images : [placeholderImage],
        amenities: hostel.amenities ?? [],
        rating: 0,
        reviews: 0,
        views: hostel.views_count ?? 0,
        verified: Boolean(hostel.is_verified || profile?.verified_badge),
        posted: formatRelativeTime(hostel.created_at),
        landlord: {
          name: landlordName,
          phone: hostel.phone_number || "",
          avatar: landlordName.charAt(0).toUpperCase(),
          verified: Boolean(profile?.verified_badge),
        },
      };
    },
  });

  const hostel = hostelQuery.data;

  const nextImage = () => {
    if (!hostel) return;
    setCurrentImageIndex((current) => (current + 1) % hostel.images.length);
  };

  const prevImage = () => {
    if (!hostel) return;
    setCurrentImageIndex((current) => (current - 1 + hostel.images.length) % hostel.images.length);
  };

  const handleContact = () => {
    if (!hostel) return;
    navigate(`/messages?to=${hostel.userId}&ref=hostel:${id}&message=Hi, I'm interested in your hostel listing: "${hostel.title}"`);
  };

  const handleShare = async () => {
    if (!hostel) return;
    const shareData = {
      title: hostel.title,
      text: `Check this CampusHub hostel listing: ${hostel.title}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }

      await navigator.clipboard.writeText(window.location.href);
      toast.success("Listing link copied");
    } catch (error: any) {
      if (error?.name !== "AbortError") {
        toast.error("Unable to share this listing right now");
      }
    }
  };

  const handleReport = () => {
    if (!hostel) return;
    window.location.href = `mailto:campushub.connect@gmail.com?subject=Report%20Hostel%20Listing&body=Listing:%20${encodeURIComponent(hostel.title)}%0AID:%20${encodeURIComponent(hostel.id)}`;
  };

  if (hostelQuery.isLoading) {
    return <div className="mx-auto max-w-4xl p-8 text-center text-muted-foreground">Loading hostel listing...</div>;
  }

  if (!hostel) {
    return <div className="mx-auto max-w-4xl p-8 text-center text-muted-foreground">Hostel listing not found.</div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
        <div className="flex-1">
          <h1 className="line-clamp-1 text-xl font-display font-bold">{hostel.title}</h1>
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><MapPin className="h-4 w-4" /><span>{hostel.location}</span></div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsFavorite(!isFavorite)}><Heart className={`h-5 w-5 ${isFavorite ? "fill-destructive text-destructive" : ""}`} /></Button>
        <Button variant="ghost" size="icon" onClick={handleShare}><Share2 className="h-5 w-5" /></Button>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
        <img src={hostel.images[currentImageIndex]} alt={hostel.title} className="h-full w-full object-cover" />
        {hostel.images.length > 1 && (
          <>
            <Button variant="ghost" size="icon" className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80" onClick={prevImage}><ChevronLeft className="h-5 w-5" /></Button>
            <Button variant="ghost" size="icon" className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80" onClick={nextImage}><ChevronRight className="h-5 w-5" /></Button>
          </>
        )}
        <div className="absolute left-4 top-4 flex gap-2">
          {hostel.verified && <Badge className="bg-success text-success-foreground"><Verified className="mr-1 h-3 w-3" />Verified</Badge>}
          <Badge variant="secondary">{hostel.type}</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-primary">
                    {formatCurrency(hostel.price)}
                    <span className="text-base font-normal text-muted-foreground">/{hostel.pricePeriod}</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Posted {hostel.posted}</p>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1"><Star className="h-5 w-5 text-warning" /><span className="font-semibold">{hostel.rating || "New"}</span></div>
                  <div className="flex items-center gap-1 text-muted-foreground"><Eye className="h-4 w-4" />{hostel.views} views</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle className="text-lg">Description</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed text-muted-foreground">{hostel.description}</p></CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle className="text-lg">Amenities</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                {hostel.amenities.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No amenities listed.</p>
                ) : (
                  hostel.amenities.map((amenity: string) => {
                    const Icon = amenityIcons[amenity] || Verified;
                    return (
                      <div key={amenity} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                        <Icon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-medium">{amenityLabels[amenity] || amenity}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader><CardTitle className="text-lg">Location</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                <div><p className="font-medium">{hostel.location}</p><p className="text-sm text-muted-foreground">Confirm exact address before payment.</p></div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card sticky top-6">
            <CardHeader><CardTitle className="text-lg">Contact Agent</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12"><AvatarFallback className="bg-primary/10 text-lg text-primary">{hostel.landlord.avatar}</AvatarFallback></Avatar>
                <div>
                  <div className="flex items-center gap-1">
                    <p className="font-semibold">{hostel.landlord.name}</p>
                    {hostel.landlord.verified && <Verified className="h-4 w-4 fill-primary text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{hostel.landlord.verified ? "Verified Agent" : "Campus Agent"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Button className="w-full" variant="hero" onClick={handleContact}><MessageCircle className="mr-2 h-4 w-4" />Contact Agent</Button>
                <Button className="w-full" variant="outline" disabled={!hostel.landlord.phone} onClick={() => setPhoneDialogOpen(true)}><Phone className="mr-2 h-4 w-4" />Call Agent</Button>
              </div>

              <Button variant="ghost" className="w-full text-muted-foreground" size="sm" onClick={handleReport}><Flag className="mr-2 h-4 w-4" />Report Listing</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Contact {hostel.landlord.name}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-muted/50 p-4 text-center"><p className="text-2xl font-bold">{hostel.landlord.phone}</p></div>
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => window.open(`tel:${hostel.landlord.phone}`)}><Phone className="mr-2 h-4 w-4" />Dial Now</Button>
              <Button variant="outline" className="flex-1" onClick={() => navigator.clipboard.writeText(hostel.landlord.phone)}>Copy Number</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HostelDetail;

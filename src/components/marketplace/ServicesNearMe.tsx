import { useState, useMemo } from "react";
import {
  Search,
  Wrench,
  Shirt,
  Printer,
  GraduationCap,
  Scissors,
  Truck,
  MapPin,
  ExternalLink,
  MessageCircle,
  CheckCircle,
  PhoneCall,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface CampusServiceItem {
  id: string;
  name: string;
  category: "tech" | "laundry" | "printing" | "tutoring" | "beauty" | "logistics";
  provider: string;
  avatarUrl?: string;
  verified: boolean;
  location: string;
  startingPrice: number;
  rating: number;
  reviewCount: number;
  phone: string;
  whatsappMessage: string;
  deliveryTime: string;
  description: string;
}

const DEFAULT_SERVICES: CampusServiceItem[] = [
  {
    id: "serv-1",
    name: "Screen & Laptop Hardware Repair",
    category: "tech",
    provider: "FastFix Campus Tech",
    verified: true,
    location: "Campus Main Gate Commercial Hub",
    startingPrice: 3500,
    rating: 4.9,
    reviewCount: 68,
    phone: "08051454564",
    whatsappMessage: "Hi FastFix, I need laptop/phone repair service from CampusHub.",
    deliveryTime: "Same Day (2-4 hrs)",
    description: "iPhone & Android screen replacement, charging port repair, thermal pasting & OS formatting.",
  },
  {
    id: "serv-2",
    name: "Express Laundry & Shirt Ironing",
    category: "laundry",
    provider: "CleanPress Campus Laundry",
    verified: true,
    location: "Hall 2 / New Hostel Block",
    startingPrice: 1500,
    rating: 4.8,
    reviewCount: 112,
    phone: "08051454564",
    whatsappMessage: "Hi CleanPress, I have a batch of clothes for wash & steam ironing via CampusHub.",
    deliveryTime: "24h Return Guarantee",
    description: "Wash, steam iron, and fold. Free pickup from all student hostels and surrounding lodges.",
  },
  {
    id: "serv-3",
    name: "Project Printing, Spiral Binding & Lamination",
    category: "printing",
    provider: "Campus Print Hub",
    verified: true,
    location: "Faculty of Science Complex",
    startingPrice: 50,
    rating: 4.9,
    reviewCount: 230,
    phone: "08051454564",
    whatsappMessage: "Hi Campus Print, I want to print and bind my project/assignment slides.",
    deliveryTime: "Instant 15-min turnaround",
    description: "Color printing, laser monochrome, thesis spiral binding, hardback binding, and document scan.",
  },
  {
    id: "serv-4",
    name: "1-on-1 Engineering & Calculus Tutoring",
    category: "tutoring",
    provider: "Engr. Victor (First Class Graduate)",
    verified: true,
    location: "Campus Library / Online Google Meet",
    startingPrice: 3000,
    rating: 5.0,
    reviewCount: 41,
    phone: "08051454564",
    whatsappMessage: "Hi Victor, looking to book tutoring sessions for engineering math / calculus on CampusHub.",
    deliveryTime: "Hourly Sessions",
    description: "MTH101, MTH201, Engineering Thermodynamics, and Circuit Analysis step-by-step masterclasses.",
  },
  {
    id: "serv-5",
    name: "Hostel Barbing & Hair Braiding On-Demand",
    category: "beauty",
    provider: "Glam & Cuts Campus Studio",
    verified: true,
    location: "Hall 4 Quadrangle",
    startingPrice: 1500,
    rating: 4.8,
    reviewCount: 95,
    phone: "08051454564",
    whatsappMessage: "Hi Glam & Cuts, I want to book a hostel room visit for barbing / hair styling.",
    deliveryTime: "Room Visit Available",
    description: "Fade haircuts, beard grooming, knotless braids, twists, and wig revamping right in your lodge.",
  },
  {
    id: "serv-6",
    name: "Hostel Room Deep Clean & Moving Van",
    category: "logistics",
    provider: "CampusMove & Cleaners",
    verified: true,
    location: "All Campus Lodges & Hostels",
    startingPrice: 5000,
    rating: 4.9,
    reviewCount: 54,
    phone: "08051454564",
    whatsappMessage: "Hi CampusMove, I need help cleaning my room and relocating to a new lodge.",
    deliveryTime: "Scheduled Pickup",
    description: "End-of-session room fumigation, tile scrubbing, moving mini-van, and mattress lifting support.",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Services", icon: null },
  { id: "tech", label: "Tech Repair", icon: Wrench },
  { id: "laundry", label: "Laundry", icon: Shirt },
  { id: "printing", label: "Print & Bind", icon: Printer },
  { id: "tutoring", label: "Tutoring", icon: GraduationCap },
  { id: "beauty", label: "Hair & Beauty", icon: Scissors },
  { id: "logistics", label: "Cleaning & Moving", icon: Truck },
] as const;

interface ServicesNearMeProps {
  onInquireDM?: (service: CampusServiceItem) => void;
  className?: string;
}

export const ServicesNearMe = ({ onInquireDM, className = "" }: ServicesNearMeProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredServices = useMemo(() => {
    return DEFAULT_SERVICES.filter((service) => {
      const matchesCategory = selectedCategory === "all" || service.category === selectedCategory;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        service.name.toLowerCase().includes(query) ||
        service.provider.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query) ||
        service.location.toLowerCase().includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/10 via-emerald-500/10 to-teal-500/10 border border-primary/20 p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold shadow-xs">
                <MapPin className="h-4 w-4" />
              </span>
              <h2 className="text-base sm:text-lg font-bold font-display tracking-tight text-foreground">
                Services Near Me
              </h2>
              <Badge variant="secondary" className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border-emerald-500/20">
                Campus Verified
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Find verified tech repairs, laundry, project printing, tutoring, and hostel services right on campus.
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            className="text-xs gap-1.5 h-8 border-primary/30 self-start sm:self-auto shrink-0"
            onClick={() =>
              window.open(
                "https://wa.me/2348051454564?text=Hi%20Admin,%20I%20want%20to%20list%20my%20campus%20service%20on%20CampusHub",
                "_blank",
              )
            }
          >
            <PhoneCall className="h-3.5 w-3.5 text-primary" />
            <span>List Your Service</span>
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative mt-3.5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search phone repair, laundry, printing, tutor, hair stylist near campus..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9.5 text-xs sm:text-sm bg-background/90 h-10 rounded-xl"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 pb-1 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                  isSelected
                    ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                    : "bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground border border-border/60"
                }`}
              >
                {Icon && <Icon className="h-3.5 w-3.5" />}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredServices.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-2xl border border-dashed border-border bg-card/50">
            <Wrench className="mx-auto h-9 w-9 text-muted-foreground/60 mb-2" />
            <h4 className="font-semibold text-sm">No campus services found</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Try searching for something else like &quot;repair&quot;, &quot;laundry&quot;, or &quot;print&quot;.
            </p>
          </div>
        ) : (
          filteredServices.map((service) => (
            <Card
              key={service.id}
              className="glass-card hover:border-primary/40 transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md"
            >
              <CardContent className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  {/* Top Provider Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Avatar className="h-8 w-8 border border-border">
                        {service.avatarUrl && <AvatarImage src={service.avatarUrl} alt={service.provider} />}
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                          {service.provider.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-semibold truncate text-foreground">{service.provider}</p>
                          {service.verified && (
                            <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                          <MapPin className="h-3 w-3 shrink-0 text-primary/70" />
                          <span className="truncate">{service.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-muted-foreground block">From</span>
                      <span className="font-bold font-mono text-sm text-primary">
                        ₦{service.startingPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="mt-2.5">
                    <h3 className="font-bold text-sm text-foreground line-clamp-1">{service.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* Footer Metrics & Actions */}
                <div className="pt-2.5 border-t border-border/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1 font-medium text-foreground">
                      ★ {service.rating} ({service.reviewCount} orders)
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {service.deliveryTime}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-0.5">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-xs h-8.5 gap-1 border-emerald-600/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      onClick={() => {
                        const url = `https://wa.me/${service.phone.replace(/^0/, "234")}?text=${encodeURIComponent(
                          service.whatsappMessage,
                        )}`;
                        window.open(url, "_blank");
                      }}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      <span>WhatsApp</span>
                    </Button>

                    <Button
                      size="sm"
                      variant="hero"
                      className="flex-1 text-xs h-8.5 gap-1"
                      onClick={() => {
                        if (onInquireDM) {
                          onInquireDM(service);
                        } else {
                          window.location.href = `/messages?to=${encodeURIComponent(
                            service.provider,
                          )}&message=${encodeURIComponent(service.whatsappMessage)}`;
                        }
                      }}
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      <span>Inquire DM</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ServicesNearMe;

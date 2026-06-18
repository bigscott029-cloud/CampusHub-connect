/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BookOpen,
  Clock,
  FileText,
  Filter,
  Heart,
  Laptop,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Shirt,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sofa,
  Upload,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

import InlineAdCard from "@/components/ads/InlineAdCard";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getProfileWithUniversity } from "@/lib/campus";
import { openFlutterwavePayment, type PaymentOpenResult } from "@/lib/payments";
import { formatCurrency, formatRelativeTime } from "@/lib/utils";

const categories = [
  { id: "all", label: "All", icon: ShoppingBag },
  { id: "phones", label: "Phones", icon: Smartphone },
  { id: "laptops", label: "Laptops", icon: Laptop },
  { id: "books", label: "Books", icon: BookOpen },
  { id: "fashion", label: "Fashion", icon: Shirt },
  { id: "furniture", label: "Furniture", icon: Sofa },
  { id: "services", label: "Services", icon: Wrench },
];

interface MarketplaceProduct {
  id: string;
  title: string;
  price: number;
  priceFormatted: string;
  condition: string;
  location: string;
  image: string;
  images: string[];
  seller: string;
  sellerId: string;
  urgent: boolean;
  posted: string;
  category: string;
  description: string;
  phone: string;
  views: number;
  listingPlan: string;
  targetScope: string;
  paymentStatus: string;
  platformFeeAmount: number;
}

interface CampusRequest {
  id: string;
  title: string;
  budget: string;
  requester: string;
  requesterId: string;
  time: string;
}

const placeholderImage = "/placeholder.svg";

const uploadListingImages = async (files: File[], userId: string) => {
  const urls: string[] = [];

  for (const file of files.slice(0, 6)) {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.]+/g, "-").toLowerCase();
    const path = `${userId}/marketplace/${crypto.randomUUID()}-${cleanName}`;
    const { error } = await supabase.storage.from("listing-media").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
    });

    if (error) throw error;

    const { data } = supabase.storage.from("listing-media").getPublicUrl(path);
    urls.push(data.publicUrl);
  }

  return urls;
};

const Marketplace = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [filterCondition, setFilterCondition] = useState("all");
  const [sellOpen, setSellOpen] = useState(false);
  const [sellSubmitted, setSellSubmitted] = useState(false);
  const [sellPayment, setSellPayment] = useState<PaymentOpenResult | null>(null);
  const [sellForm, setSellForm] = useState({
    title: "",
    description: "",
    price: "",
    condition: "",
    category: "",
    location: "",
    phone: "",
    isUrgent: false,
    listingPlan: "commission",
    targetScope: "local",
  });
  const [sellFiles, setSellFiles] = useState<File[]>([]);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ title: "", budget: "", details: "" });
  const [agentOpen, setAgentOpen] = useState(false);
  const [agentPayment, setAgentPayment] = useState<PaymentOpenResult | null>(null);
  const [agentForm, setAgentForm] = useState({ legalName: "", phone: "", businessName: "" });
  const [activeTab, setActiveTab] = useState("browse");
  const sellImageRef = useRef<HTMLInputElement>(null);

  const listingsQuery = useQuery({
    queryKey: ["marketplace-listings"],
    queryFn: async (): Promise<MarketplaceProduct[]> => {
      const { data: listings, error } = await (supabase as any)
        .from("marketplace_listings")
        .select("id, user_id, title, description, price, category, condition, location, images, is_urgent, created_at, seller_phone, views_count, listing_plan, target_scope, payment_status, platform_fee_amount")
        .eq("status", "approved")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = Array.from(new Set((listings ?? []).map((listing: any) => listing.user_id)));
      const { data: profiles } = userIds.length
        ? await (supabase as any).from("profiles").select("user_id, display_name").in("user_id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles ?? []).map((profile: any) => [profile.user_id, profile]));

      return (listings ?? []).map((listing: any) => {
        const seller = profileMap.get(listing.user_id)?.display_name || "Campus Seller";
        const images = listing.images?.length ? listing.images : [placeholderImage];

        return {
          id: listing.id,
          title: listing.title,
          price: Number(listing.price ?? 0),
          priceFormatted: formatCurrency(Number(listing.price ?? 0)),
          condition: listing.condition || "Good",
          location: listing.location || "Campus",
          image: images[0],
          images,
          seller,
          sellerId: listing.user_id,
          urgent: Boolean(listing.is_urgent),
          posted: formatRelativeTime(listing.created_at),
          category: listing.category,
          description: listing.description || "No description provided.",
          phone: listing.seller_phone || "",
          views: listing.views_count ?? 0,
          listingPlan: listing.listing_plan || "commission",
          targetScope: listing.target_scope || "local",
          paymentStatus: listing.payment_status || "not_required",
          platformFeeAmount: Number(listing.platform_fee_amount ?? 0),
        };
      });
    },
  });

  const requestsQuery = useQuery({
    queryKey: ["marketplace-campus-requests"],
    queryFn: async (): Promise<CampusRequest[]> => {
      const { data, error } = await supabase
        .from("roommate_requests")
        .select("id, user_id, title, budget_min, budget_max, created_at")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(12);

      if (error) throw error;

      const userIds = Array.from(new Set((data ?? []).map((request) => request.user_id)));
      const { data: profiles } = userIds.length
        ? await (supabase as any).from("profiles").select("user_id, display_name").in("user_id", userIds)
        : { data: [] };
      const profileMap = new Map((profiles ?? []).map((profile: any) => [profile.user_id, profile]));

      return (data ?? []).map((request) => ({
        id: request.id,
        title: request.title,
        budget: [request.budget_min, request.budget_max].filter(Boolean).map((value) => formatCurrency(Number(value))).join(" - ") || "Open budget",
        requester: profileMap.get(request.user_id)?.display_name || "Campus Member",
        requesterId: request.user_id,
        time: formatRelativeTime(request.created_at),
      }));
    },
  });

  const filteredProducts = useMemo(() => {
    return (listingsQuery.data ?? []).filter((product) => {
      const matchesSearch = `${product.title} ${product.seller}`.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesPrice = product.price >= priceRange[0] && product.price <= priceRange[1];
      const matchesCondition = filterCondition === "all" || product.condition.includes(filterCondition);
      return matchesSearch && matchesCategory && matchesPrice && matchesCondition;
    });
  }, [filterCondition, listingsQuery.data, priceRange, searchQuery, selectedCategory]);

  const submitListingMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to sell on the marketplace.");
      if (!sellForm.title || !sellForm.price || !sellForm.category) throw new Error("Please fill required fields.");

      const [{ profile }, imageUrls] = await Promise.all([
        getProfileWithUniversity(user.id),
        uploadListingImages(sellFiles, user.id),
      ]);
      if (sellForm.listingPlan === "verified_agent") {
        if ((profile as any)?.agent_verification_status !== "verified") {
          throw new Error("Verified agent listings require an approved agent account first.");
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const [{ count: todayCount }, { count: monthCount }] = await Promise.all([
          (supabase as any)
            .from("marketplace_listings")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("created_at", today.toISOString()),
          (supabase as any)
            .from("marketplace_listings")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("created_at", monthStart.toISOString()),
        ]);

        const dailyLimit = (profile as any)?.agent_daily_post_limit ?? 10;
        const monthlyLimit = (profile as any)?.agent_monthly_post_limit ?? 100;
        if ((todayCount ?? 0) >= dailyLimit) throw new Error(`Verified agents can post ${dailyLimit} listings per day.`);
        if ((monthCount ?? 0) >= monthlyLimit) throw new Error(`Verified agents can post ${monthlyLimit} listings per month.`);
      }
      const price = Number(sellForm.price);
      const platformFeeAmount = sellForm.listingPlan === "upfront_fee" ? price * 0.1 : 0;
      const paymentStatus = sellForm.listingPlan === "upfront_fee" ? "pending" : "not_required";

      const { data: listing, error } = await (supabase as any)
        .from("marketplace_listings")
        .insert({
          user_id: user.id,
          title: sellForm.title.trim(),
          description: sellForm.description.trim() || null,
          price,
          condition: sellForm.condition || null,
          category: sellForm.category,
          location: sellForm.location.trim() || null,
          seller_phone: sellForm.phone.trim() || null,
          is_urgent: sellForm.isUrgent,
          images: imageUrls,
          status: "pending",
          university_id: profile?.university_id ?? null,
          listing_plan: sellForm.listingPlan,
          target_scope: sellForm.targetScope,
          commission_rate: 0.1,
          platform_fee_amount: platformFeeAmount,
          payment_status: paymentStatus,
        })
        .select("id")
        .single();

      if (error) throw error;

      await supabase.from("admin_requests").insert({
        user_id: user.id,
        request_type: "marketplace_listing",
        reference_id: listing.id,
        status: "pending",
      });

      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Listing Submitted",
        description: "Your marketplace listing is being reviewed.",
        type: "listing",
        is_important: true,
        reference_type: "marketplace_listing",
        reference_id: listing.id,
      });

      return {
        listingId: listing.id as string,
        listingPlan: sellForm.listingPlan,
        platformFeeAmount,
        sellerName: (profile as any)?.display_name as string | null | undefined,
      };
    },
    onSuccess: ({ listingId, listingPlan, platformFeeAmount, sellerName }) => {
      if (listingPlan === "upfront_fee" && platformFeeAmount > 0) {
        const payment = openFlutterwavePayment({
          amount: platformFeeAmount,
          purpose: "marketplace_upfront_fee",
          referenceId: listingId,
          customerEmail: user?.email,
          customerName: sellerName,
        });
        setSellPayment(payment);
      } else {
        setSellPayment(null);
      }

      setSellSubmitted(true);
      setSellForm({ title: "", description: "", price: "", condition: "", category: "", location: "", phone: "", isUrgent: false, listingPlan: "commission", targetScope: "local" });
      setSellFiles([]);
      queryClient.invalidateQueries({ queryKey: ["marketplace-listings"] });
    },
    onError: (error) => toast.error(error.message),
  });

  const agentMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to become a verified agent.");
      if (!agentForm.legalName || !agentForm.phone) throw new Error("Please add your legal name and phone number.");

      const { profile } = await getProfileWithUniversity(user.id);
      const { data: request, error } = await (supabase as any)
        .from("agent_verification_requests")
        .insert({
          user_id: user.id,
          university_id: profile?.university_id ?? null,
          legal_name: agentForm.legalName.trim(),
          phone_number: agentForm.phone.trim(),
          business_name: agentForm.businessName.trim() || null,
          fee_amount: 20000,
          status: "pending_payment",
        })
        .select("id")
        .single();

      if (error) throw error;

      await supabase.from("admin_requests").insert({
        user_id: user.id,
        request_type: "agent_verification",
        reference_id: request.id,
        status: "pending",
      });

      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Agent Verification Started",
        description: "Your verified agent request has been submitted. Admin will confirm your details and payment.",
        type: "verification",
        is_important: true,
        reference_type: "agent_verification",
        reference_id: request.id,
      });

      return {
        requestId: request.id as string,
        legalName: agentForm.legalName.trim(),
      };
    },
    onSuccess: ({ requestId, legalName }) => {
      const payment = openFlutterwavePayment({
        amount: 20000,
        purpose: "agent_verification",
        referenceId: requestId,
        customerEmail: user?.email,
        customerName: legalName,
      });

      setAgentPayment(payment);
      toast.success("Agent verification request submitted.");
      setAgentForm({ legalName: "", phone: "", businessName: "" });
    },
    onError: (error) => toast.error(error.message),
  });

  const toggleFavorite = (id: string) => {
    setFavorites((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const handleSellImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    setSellFiles((current) => [...current, ...files].slice(0, 6));
  };

  const handleRequestSubmit = () => {
    if (!requestForm.title) {
      toast.error("Please add a title");
      return;
    }

    toast.info("Marketplace requests need a dedicated table. For now, approved campus requests are shown from roommate requests.");
    setRequestOpen(false);
    setRequestForm({ title: "", budget: "", details: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border module-marketplace">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Marketplace</h1>
            <p className="text-sm text-muted-foreground">Buy and sell within your campus community</p>
          </div>
        </div>
        <Button variant="hero" onClick={() => { setSellOpen(true); setSellSubmitted(false); }}>
          <Plus className="mr-1 h-4 w-4" />Sell Something
        </Button>
        <Button variant="outline" onClick={() => setAgentOpen(true)}>
          <ShieldCheck className="mr-1 h-4 w-4" />Become Agent
        </Button>
      </div>

      <Card className="glass-card">
        <CardContent className="py-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search for items..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setFilterOpen(true)}>
              <Filter className="h-4 w-4" />Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="browse" className="gap-1"><ShoppingBag className="h-4 w-4" />Browse</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1"><FileText className="h-4 w-4" />Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <Button key={category.id} variant={selectedCategory === category.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(category.id)} className="shrink-0 gap-1">
                <category.icon className="h-4 w-4" />{category.label}
              </Button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <div key={product.id} className="contents">
                {index > 0 && index % 6 === 0 && <InlineAdCard placement="marketplace" />}
              <Card className="glass-card hover-lift cursor-pointer overflow-hidden" onClick={() => { setSelectedProduct(product); setDetailOpen(true); }}>
                <div className="relative aspect-square bg-muted">
                  <img src={product.image} alt={product.title} className="h-full w-full object-cover" />
                  {product.urgent && <Badge className="absolute left-2 top-2 bg-destructive"><Zap className="mr-1 h-3 w-3" />Urgent</Badge>}
                  <Button variant="ghost" size="icon" className="absolute right-2 top-2 h-8 w-8 bg-background/80" onClick={(event) => { event.stopPropagation(); toggleFavorite(product.id); }}>
                    <Heart className={`h-4 w-4 ${favorites.includes(product.id) ? "fill-destructive text-destructive" : ""}`} />
                  </Button>
                </div>
                <CardContent className="p-3">
                  <h3 className="line-clamp-2 text-sm font-semibold">{product.title}</h3>
                  <p className="mt-1 text-lg font-bold text-primary">{product.priceFormatted}</p>
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{product.location}</div>
                  <div className="mt-3 flex items-center justify-between border-t border-border/50 pt-3">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{product.posted}</div>
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={(event) => { event.stopPropagation(); navigate(`/messages?to=${product.sellerId}&message=Hi, I'm interested in "${product.title}"`); }}>
                      <MessageCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
              </div>
            ))}
          </div>

          {!listingsQuery.isLoading && filteredProducts.length === 0 && (
            <Card className="glass-card p-8 text-center">
              <Search className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No items found. Try a different search or filter.</p>
              <Button variant="outline" className="mt-4" onClick={() => setRequestOpen(true)}>Post a Request</Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Campus Requests</h2>
            <Button variant="outline" size="sm" onClick={() => setRequestOpen(true)}><Plus className="mr-1 h-4 w-4" />Post Request</Button>
          </div>
          {(requestsQuery.data ?? []).map((request) => (
            <Card key={request.id} className="glass-card">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <h3 className="text-sm font-semibold">{request.title}</h3>
                  <p className="mt-1 text-xs text-muted-foreground">Budget: {request.budget} • by {request.requester} • {request.time}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/messages?to=${request.requesterId}&message=I saw your campus request: "${request.title}"`)}>
                  <MessageCircle className="mr-1 h-4 w-4" />Respond
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          {selectedProduct && (
            <div className="space-y-4">
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                <img src={selectedProduct.image} alt={selectedProduct.title} className="h-full w-full object-cover" />
              </div>
              <div>
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-display font-bold">{selectedProduct.title}</h2>
                  {selectedProduct.urgent && <Badge className="bg-destructive"><Zap className="mr-1 h-3 w-3" />Urgent</Badge>}
                </div>
                <p className="mt-2 text-2xl font-bold text-primary">{selectedProduct.priceFormatted}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="rounded-lg bg-muted/50 p-2"><p className="text-muted-foreground">Condition</p><p className="font-medium">{selectedProduct.condition}</p></div>
                <div className="rounded-lg bg-muted/50 p-2"><p className="text-muted-foreground">Location</p><p className="font-medium">{selectedProduct.location}</p></div>
                <div className="rounded-lg bg-muted/50 p-2"><p className="text-muted-foreground">Views</p><p className="font-medium">{selectedProduct.views}</p></div>
              </div>
              <div><h3 className="mb-2 font-semibold">Description</h3><p className="text-sm text-muted-foreground">{selectedProduct.description}</p></div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/30 p-3">
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary">{selectedProduct.seller.charAt(0)}</AvatarFallback></Avatar>
                <div className="flex-1"><p className="text-sm font-medium">{selectedProduct.seller}</p><p className="text-xs text-muted-foreground">Posted {selectedProduct.posted}</p></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" disabled={!selectedProduct.phone} onClick={() => window.open(`tel:${selectedProduct.phone}`)}>
                  <Phone className="mr-2 h-4 w-4" />Call
                </Button>
                <Button variant="hero" className="flex-1" onClick={() => { setDetailOpen(false); navigate(`/messages?to=${selectedProduct.sellerId}&message=Hi, I'm interested in "${selectedProduct.title}"`); }}>
                  <MessageCircle className="mr-2 h-4 w-4" />Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Filter Products</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div>
              <Label>Price Range</Label>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm">{formatCurrency(priceRange[0])}</span>
                <Slider value={priceRange} onValueChange={setPriceRange} max={500000} min={0} step={5000} className="flex-1" />
                <span className="text-sm">{formatCurrency(priceRange[1])}</span>
              </div>
            </div>
            <div>
              <Label>Condition</Label>
              <Select value={filterCondition} onValueChange={setFilterCondition}>
                <SelectTrigger><SelectValue placeholder="Any condition" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any</SelectItem>
                  <SelectItem value="Like New">Like New</SelectItem>
                  <SelectItem value="Good">Good</SelectItem>
                  <SelectItem value="Fair">Fair</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => { setPriceRange([0, 500000]); setFilterCondition("all"); }}>Clear</Button>
              <Button className="flex-1" onClick={() => setFilterOpen(false)}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={sellOpen}
        onOpenChange={(open) => {
          setSellOpen(open);
          if (open) {
            setSellSubmitted(false);
            setSellPayment(null);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>{sellSubmitted ? "Listing Submitted!" : "Sell Something"}</DialogTitle></DialogHeader>
          {sellSubmitted ? (
            <div className="space-y-4 py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10"><ShoppingBag className="h-8 w-8 text-success" /></div>
              <p className="text-muted-foreground">Your listing is being reviewed for approval by an admin.</p>
              {sellPayment && (
                <Button variant="hero" className="w-full" onClick={() => window.open(sellPayment.url, "_blank", "noopener,noreferrer")}>
                  {sellPayment.label}
                </Button>
              )}
              <Button onClick={() => setSellOpen(false)}>Close</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div><Label>Title *</Label><Input placeholder="What are you selling?" value={sellForm.title} onChange={(event) => setSellForm({ ...sellForm, title: event.target.value })} /></div>
              <div><Label>Description</Label><Textarea placeholder="Describe your item..." value={sellForm.description} onChange={(event) => setSellForm({ ...sellForm, description: event.target.value })} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price *</Label><Input type="number" placeholder="e.g. 50000" value={sellForm.price} onChange={(event) => setSellForm({ ...sellForm, price: event.target.value })} /></div>
                <div><Label>Category *</Label><Select value={sellForm.category} onValueChange={(value) => setSellForm({ ...sellForm, category: value })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.filter((category) => category.id !== "all").map((category) => <SelectItem key={category.id} value={category.id}>{category.label}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Condition</Label><Select value={sellForm.condition} onValueChange={(value) => setSellForm({ ...sellForm, condition: value })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Like New">Like New</SelectItem><SelectItem value="Good">Good</SelectItem><SelectItem value="Fair">Fair</SelectItem></SelectContent></Select></div>
                <div><Label>Location</Label><Input placeholder="e.g. Block A" value={sellForm.location} onChange={(event) => setSellForm({ ...sellForm, location: event.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Listing Model</Label>
                  <Select value={sellForm.listingPlan} onValueChange={(value) => setSellForm({ ...sellForm, listingPlan: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="commission">Free now, 10% on sale</SelectItem>
                      <SelectItem value="upfront_fee">Pay 10% upfront</SelectItem>
                      <SelectItem value="verified_agent">Verified agent listing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target</Label>
                  <Select value={sellForm.targetScope} onValueChange={(value) => setSellForm({ ...sellForm, targetScope: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">My school/local area</SelectItem>
                      <SelectItem value="regional">My region</SelectItem>
                      <SelectItem value="nationwide">Nationwide</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="py-3 text-sm text-muted-foreground">
                  {sellForm.listingPlan === "commission" && "You can list for free now. Admin approval is required, and 10% is due from the sale amount when the item sells."}
                  {sellForm.listingPlan === "upfront_fee" && `A 10% listing fee is due before approval: ${formatCurrency(Number(sellForm.price || 0) * 0.1)}. Flutterwave checkout opens after submission when configured; otherwise CampusHub DM opens as the backup route.`}
                  {sellForm.listingPlan === "verified_agent" && "Verified agents pay a one-time ₦20,000 verification fee, then list with daily and monthly limits after admin approval."}
                </CardContent>
              </Card>
              <div><Label>Phone</Label><Input type="tel" placeholder="+234..." value={sellForm.phone} onChange={(event) => setSellForm({ ...sellForm, phone: event.target.value })} /></div>
              <div>
                <Label>Images (up to 6)</Label>
                <input ref={sellImageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleSellImageUpload} />
                <Button variant="outline" className="mt-1 w-full" onClick={() => sellImageRef.current?.click()}><Upload className="mr-2 h-4 w-4" />Upload Images</Button>
                {sellFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {sellFiles.map((file, index) => (
                      <div key={`${file.name}-${index}`} className="group relative">
                        <img src={URL.createObjectURL(file)} alt="" className="h-16 w-16 rounded object-cover" />
                        <Button variant="destructive" size="icon" className="absolute -right-2 -top-2 h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => setSellFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))}><X className="h-3 w-3" /></Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2">
                <Checkbox checked={sellForm.isUrgent} onCheckedChange={(checked) => setSellForm({ ...sellForm, isUrgent: Boolean(checked) })} />
                <span className="text-sm">Mark as Urgent</span>
              </label>
              {sellForm.isUrgent && <Card className="border-warning/30 bg-warning/5"><CardContent className="py-3 text-sm text-muted-foreground">Urgent listings are queued for paid boost or commission review.</CardContent></Card>}
              <Button variant="hero" className="w-full" onClick={() => submitListingMutation.mutate()} disabled={submitListingMutation.isPending}>
                {submitListingMutation.isPending ? "Submitting..." : "Submit for Review"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Post a Market Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>What are you looking for? *</Label><Input placeholder="e.g. 2nd-hand MacBook Air" value={requestForm.title} onChange={(event) => setRequestForm({ ...requestForm, title: event.target.value })} /></div>
            <div><Label>Budget</Label><Input placeholder="e.g. ₦200K - ₦300K" value={requestForm.budget} onChange={(event) => setRequestForm({ ...requestForm, budget: event.target.value })} /></div>
            <div><Label>Details</Label><Textarea placeholder="Any specific requirements..." value={requestForm.details} onChange={(event) => setRequestForm({ ...requestForm, details: event.target.value })} rows={3} /></div>
            <Button variant="hero" className="w-full" onClick={handleRequestSubmit}>Post Request</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog
        open={agentOpen}
        onOpenChange={(open) => {
          setAgentOpen(open);
          if (open) setAgentPayment(null);
        }}
      >
        <DialogContent>
          <DialogHeader><DialogTitle>Become a Verified Agent</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="py-3 text-sm text-muted-foreground">
                Verified agents pay a one-time {formatCurrency(20000)} fee, then receive a blue verified badge after admin approval. Limits: 10 listings per day and 100 per month. Flutterwave checkout opens after submission when configured; otherwise CampusHub DM opens as the backup route.
              </CardContent>
            </Card>
            {agentPayment && (
              <Card className="border-success/30 bg-success/5">
                <CardContent className="space-y-3 py-3 text-sm text-muted-foreground">
                  <p>Your agent verification request has been saved. Complete payment {agentPayment.channel === "dm" ? "through CampusHub DM" : "through Flutterwave"} so admin can verify and activate the badge.</p>
                  <Button variant="hero" className="w-full" onClick={() => window.open(agentPayment.url, "_blank", "noopener,noreferrer")}>
                    {agentPayment.label}
                  </Button>
                </CardContent>
              </Card>
            )}
            <div><Label>Legal Name *</Label><Input value={agentForm.legalName} onChange={(event) => setAgentForm({ ...agentForm, legalName: event.target.value })} placeholder="Your full legal name" /></div>
            <div><Label>Phone Number *</Label><Input type="tel" value={agentForm.phone} onChange={(event) => setAgentForm({ ...agentForm, phone: event.target.value })} placeholder="+234..." /></div>
            <div><Label>Business Name</Label><Input value={agentForm.businessName} onChange={(event) => setAgentForm({ ...agentForm, businessName: event.target.value })} placeholder="Optional" /></div>
            <Button variant="hero" className="w-full" onClick={() => agentMutation.mutate()} disabled={agentMutation.isPending}>
              {agentMutation.isPending ? "Submitting..." : "Submit Agent Request"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  Heart,
  MessageCircle,
  Smartphone,
  Laptop,
  BookOpen,
  Shirt,
  Sofa,
  Wrench,
  MapPin,
  Clock,
  Zap,
  ArrowLeft,
  Phone,
  Star,
  Eye,
  Upload,
  X,
  Send,
  FileText,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const categories = [
  { id: "all", label: "All", icon: ShoppingBag },
  { id: "phones", label: "Phones", icon: Smartphone },
  { id: "laptops", label: "Laptops", icon: Laptop },
  { id: "books", label: "Books", icon: BookOpen },
  { id: "fashion", label: "Fashion", icon: Shirt },
  { id: "furniture", label: "Furniture", icon: Sofa },
  { id: "services", label: "Services", icon: Wrench },
];

const mockProducts = [
  { id: 1, title: "iPhone 13 Pro - 256GB", price: 450000, priceFormatted: "₦450,000", condition: "Used - Like New", location: "Block A, Campus", image: "/placeholder.svg", seller: "TechGuy99", sellerId: "tech1", urgent: true, posted: "2 hours ago", category: "phones", description: "Perfect condition iPhone 13 Pro with 256GB storage. Comes with original box, charger, and earbuds. Battery health at 94%.", phone: "+234 801 234 5678", views: 234 },
  { id: 2, title: "Calculus Textbook (Stewart 8th Ed)", price: 8000, priceFormatted: "₦8,000", condition: "Good", location: "Library Area", image: "/placeholder.svg", seller: "BookWorm", sellerId: "book1", posted: "5 hours ago", category: "books", description: "Stewart's Calculus 8th Edition. Used for MTH 101/201. Some highlights but in good condition.", phone: "+234 802 345 6789", views: 89 },
  { id: 3, title: "HP Pavilion Laptop - Core i5", price: 280000, priceFormatted: "₦280,000", condition: "Used - Good", location: "Off Campus", image: "/placeholder.svg", seller: "CompSciStudent", sellerId: "comp1", posted: "1 day ago", category: "laptops", description: "HP Pavilion with Intel Core i5, 8GB RAM, 256GB SSD. Great for schoolwork and light gaming.", phone: "+234 803 456 7890", views: 178 },
  { id: 4, title: "Reading Desk + Chair Set", price: 25000, priceFormatted: "₦25,000", condition: "Good", location: "Main Gate Area", image: "/placeholder.svg", seller: "GraduatingSoon", sellerId: "grad1", urgent: true, posted: "3 hours ago", category: "furniture", description: "Solid wood reading desk with comfortable swivel chair. Selling because I'm graduating.", phone: "+234 804 567 8901", views: 56 },
];

const mockRequests = [
  { id: 1, title: "Looking for 2nd-hand MacBook Air", budget: "₦300K - ₦400K", requester: "Jane D.", time: "1 hour ago" },
  { id: 2, title: "Need Physics 201 textbook", budget: "Under ₦5K", requester: "Mike T.", time: "3 hours ago" },
];

const Marketplace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState<number[]>([]);

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<typeof mockProducts[0] | null>(null);

  // Filter dialog
  const [filterOpen, setFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [filterCondition, setFilterCondition] = useState("");

  // Sell dialog
  const [sellOpen, setSellOpen] = useState(false);
  const [sellSubmitted, setSellSubmitted] = useState(false);
  const [sellForm, setSellForm] = useState({ title: "", description: "", price: "", condition: "", category: "", location: "", phone: "", isUrgent: false, images: [] as string[] });
  const sellImageRef = useRef<HTMLInputElement>(null);

  // Request dialog
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestForm, setRequestForm] = useState({ title: "", budget: "", details: "" });

  // Active tab
  const [activeTab, setActiveTab] = useState("browse");

  const filteredProducts = mockProducts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.seller.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchesPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
    const matchesCondition = !filterCondition || p.condition.includes(filterCondition);
    return matchesSearch && matchesCategory && matchesPrice && matchesCondition;
  });

  const toggleFavorite = (id: number) => {
    setFavorites(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSellSubmit = async () => {
    if (!sellForm.title || !sellForm.price || !sellForm.category) { toast.error("Please fill required fields"); return; }
    if (user) {
      await supabase.from("marketplace_listings").insert({
        user_id: user.id, title: sellForm.title, description: sellForm.description,
        price: parseFloat(sellForm.price), condition: sellForm.condition, category: sellForm.category,
        location: sellForm.location, is_urgent: sellForm.isUrgent, images: sellForm.images, status: "pending",
      });
      await supabase.from("admin_requests").insert({ user_id: user.id, request_type: "marketplace_listing", status: "pending" });
      await supabase.from("notifications").insert({ user_id: user.id, title: "Listing Submitted", description: "Your marketplace listing is being reviewed.", type: "listing", is_important: true });
    }
    setSellSubmitted(true);
  };

  const handleSellImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setSellForm(prev => ({ ...prev, images: [...prev.images, ev.target?.result as string].slice(0, 6) }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRequestSubmit = () => {
    if (!requestForm.title) { toast.error("Please add a title"); return; }
    toast.success("Request posted! Others will see it in the Requests section.");
    setRequestOpen(false);
    setRequestForm({ title: "", budget: "", details: "" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl module-marketplace border flex items-center justify-center"><ShoppingBag className="w-5 h-5" /></div>
          <div><h1 className="text-2xl font-display font-bold">Marketplace</h1><p className="text-sm text-muted-foreground">Buy & sell within your campus community</p></div>
        </div>
        <Button variant="hero" onClick={() => { setSellOpen(true); setSellSubmitted(false); }}><Plus className="w-4 h-4 mr-1" />Sell Something</Button>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search for items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Button variant="outline" className="gap-2" onClick={() => setFilterOpen(true)}><Filter className="w-4 h-4" />Filters</Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="browse" className="gap-1"><ShoppingBag className="w-4 h-4" />Browse</TabsTrigger>
          <TabsTrigger value="requests" className="gap-1"><FileText className="w-4 h-4" />Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <Button key={cat.id} variant={selectedCategory === cat.id ? "default" : "outline"} size="sm" onClick={() => setSelectedCategory(cat.id)} className="gap-1 shrink-0">
                <cat.icon className="w-4 h-4" />{cat.label}
              </Button>
            ))}
          </div>

          {/* Products */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="glass-card hover-lift overflow-hidden cursor-pointer" onClick={() => { setSelectedProduct(product); setDetailOpen(true); }}>
                <div className="aspect-square bg-muted relative">
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                  {product.urgent && (<Badge className="absolute top-2 left-2 bg-destructive"><Zap className="w-3 h-3 mr-1" />Urgent</Badge>)}
                  <Button variant="ghost" size="icon" className="absolute top-2 right-2 bg-background/80 h-8 w-8" onClick={(e) => { e.stopPropagation(); toggleFavorite(product.id); }}>
                    <Heart className={`w-4 h-4 ${favorites.includes(product.id) ? "fill-destructive text-destructive" : ""}`} />
                  </Button>
                </div>
                <CardContent className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2">{product.title}</h3>
                  <p className="text-lg font-bold text-primary mt-1">{product.priceFormatted}</p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2"><MapPin className="w-3 h-3" />{product.location}</div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="w-3 h-3" />{product.posted}</div>
                    <Button variant="ghost" size="sm" className="h-7 px-2" onClick={(e) => { e.stopPropagation(); navigate(`/messages?to=${product.seller}&message=Hi, I'm interested in "${product.title}"`); }}>
                      <MessageCircle className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <Card className="glass-card p-8 text-center">
              <Search className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No items found. Try a different search or filter.</p>
              <Button variant="outline" className="mt-4" onClick={() => setRequestOpen(true)}>Post a Request</Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold">Market Requests</h2>
            <Button variant="outline" size="sm" onClick={() => setRequestOpen(true)}><Plus className="w-4 h-4 mr-1" />Post Request</Button>
          </div>
          {mockRequests.map((req) => (
            <Card key={req.id} className="glass-card">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-sm">{req.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">Budget: {req.budget} • by {req.requester} • {req.time}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/messages?to=${req.requester}&message=I have what you're looking for: "${req.title}"`)}>
                  <MessageCircle className="w-4 h-4 mr-1" />Respond
                </Button>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Product Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedProduct && (
            <div className="space-y-4">
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img src={selectedProduct.image} alt={selectedProduct.title} className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-start justify-between">
                  <h2 className="text-xl font-display font-bold">{selectedProduct.title}</h2>
                  {selectedProduct.urgent && <Badge className="bg-destructive"><Zap className="w-3 h-3 mr-1" />Urgent</Badge>}
                </div>
                <p className="text-2xl font-bold text-primary mt-2">{selectedProduct.priceFormatted}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center text-sm">
                <div className="p-2 rounded-lg bg-muted/50"><p className="text-muted-foreground">Condition</p><p className="font-medium">{selectedProduct.condition}</p></div>
                <div className="p-2 rounded-lg bg-muted/50"><p className="text-muted-foreground">Location</p><p className="font-medium">{selectedProduct.location}</p></div>
                <div className="p-2 rounded-lg bg-muted/50"><p className="text-muted-foreground">Views</p><p className="font-medium">{selectedProduct.views}</p></div>
              </div>
              <div><h3 className="font-semibold mb-2">Description</h3><p className="text-sm text-muted-foreground">{selectedProduct.description}</p></div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                <Avatar className="h-10 w-10"><AvatarFallback className="bg-primary/10 text-primary">{selectedProduct.seller.charAt(0)}</AvatarFallback></Avatar>
                <div className="flex-1"><p className="font-medium text-sm">{selectedProduct.seller}</p><p className="text-xs text-muted-foreground">Posted {selectedProduct.posted}</p></div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => window.open(`tel:${selectedProduct.phone}`)}><Phone className="w-4 h-4 mr-2" />Call</Button>
                <Button variant="hero" className="flex-1" onClick={() => { setDetailOpen(false); navigate(`/messages?to=${selectedProduct.seller}&message=Hi, I'm interested in "${selectedProduct.title}"`); }}>
                  <MessageCircle className="w-4 h-4 mr-2" />Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Filter Products</DialogTitle></DialogHeader>
          <div className="space-y-6">
            <div><Label>Price Range</Label><div className="flex items-center gap-2 mt-2"><span className="text-sm">₦{(priceRange[0] / 1000).toFixed(0)}K</span><Slider value={priceRange} onValueChange={setPriceRange} max={500000} min={0} step={5000} className="flex-1" /><span className="text-sm">₦{(priceRange[1] / 1000).toFixed(0)}K</span></div></div>
            <div><Label>Condition</Label><Select value={filterCondition} onValueChange={setFilterCondition}><SelectTrigger><SelectValue placeholder="Any condition" /></SelectTrigger><SelectContent><SelectItem value="">Any</SelectItem><SelectItem value="Like New">Like New</SelectItem><SelectItem value="Good">Good</SelectItem><SelectItem value="Fair">Fair</SelectItem></SelectContent></Select></div>
            <div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => { setPriceRange([0, 500000]); setFilterCondition(""); }}>Clear</Button><Button className="flex-1" onClick={() => setFilterOpen(false)}>Apply</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Sell Dialog */}
      <Dialog open={sellOpen} onOpenChange={setSellOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{sellSubmitted ? "Listing Submitted!" : "Sell Something"}</DialogTitle></DialogHeader>
          {sellSubmitted ? (
            <div className="text-center space-y-4 py-6">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto"><ShoppingBag className="w-8 h-8 text-success" /></div>
              <p className="text-muted-foreground">Your listing is being reviewed for approval by an admin.</p>
              <Button onClick={() => setSellOpen(false)}>Close</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div><Label>Title *</Label><Input placeholder="What are you selling?" value={sellForm.title} onChange={(e) => setSellForm({ ...sellForm, title: e.target.value })} /></div>
              <div><Label>Description</Label><Textarea placeholder="Describe your item..." value={sellForm.description} onChange={(e) => setSellForm({ ...sellForm, description: e.target.value })} rows={3} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Price (₦) *</Label><Input type="number" placeholder="e.g. 50000" value={sellForm.price} onChange={(e) => setSellForm({ ...sellForm, price: e.target.value })} /></div>
                <div><Label>Category *</Label><Select value={sellForm.category} onValueChange={(v) => setSellForm({ ...sellForm, category: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{categories.filter(c => c.id !== "all").map(c => <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Condition</Label><Select value={sellForm.condition} onValueChange={(v) => setSellForm({ ...sellForm, condition: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="Like New">Like New</SelectItem><SelectItem value="Good">Good</SelectItem><SelectItem value="Fair">Fair</SelectItem></SelectContent></Select></div>
                <div><Label>Location</Label><Input placeholder="e.g. Block A" value={sellForm.location} onChange={(e) => setSellForm({ ...sellForm, location: e.target.value })} /></div>
              </div>
              <div><Label>Phone</Label><Input type="tel" placeholder="+234..." value={sellForm.phone} onChange={(e) => setSellForm({ ...sellForm, phone: e.target.value })} /></div>
              <div>
                <Label>Images (up to 6)</Label>
                <input ref={sellImageRef} type="file" accept="image/*" multiple className="hidden" onChange={handleSellImageUpload} />
                <Button variant="outline" className="w-full mt-1" onClick={() => sellImageRef.current?.click()}><Upload className="w-4 h-4 mr-2" />Upload Images</Button>
                {sellForm.images.length > 0 && <div className="flex gap-2 flex-wrap mt-2">{sellForm.images.map((img, i) => <div key={i} className="relative group"><img src={img} alt="" className="w-16 h-16 object-cover rounded" /><Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => setSellForm(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}><X className="h-3 w-3" /></Button></div>)}</div>}
              </div>
              <label className="flex items-center gap-2">
                <Checkbox checked={sellForm.isUrgent} onCheckedChange={(c) => setSellForm({ ...sellForm, isUrgent: !!c })} />
                <span className="text-sm">Mark as Urgent (requires paid plan or commission)</span>
              </label>
              {sellForm.isUrgent && <Card className="border-warning/30 bg-warning/5"><CardContent className="py-3 text-sm text-muted-foreground">Urgent listings require a paid tier or a percentage commission on sales. This will be reviewed by admin.</CardContent></Card>}
              <Button variant="hero" className="w-full" onClick={handleSellSubmit}>Submit for Review</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Request Dialog */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Post a Market Request</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>What are you looking for? *</Label><Input placeholder="e.g. 2nd-hand MacBook Air" value={requestForm.title} onChange={(e) => setRequestForm({ ...requestForm, title: e.target.value })} /></div>
            <div><Label>Budget</Label><Input placeholder="e.g. ₦200K - ₦300K" value={requestForm.budget} onChange={(e) => setRequestForm({ ...requestForm, budget: e.target.value })} /></div>
            <div><Label>Details</Label><Textarea placeholder="Any specific requirements..." value={requestForm.details} onChange={(e) => setRequestForm({ ...requestForm, details: e.target.value })} rows={3} /></div>
            <Button variant="hero" className="w-full" onClick={handleRequestSubmit}>Post Request</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Marketplace;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "lucide-react";

const categories = [
  { id: "phones", label: "Phones", icon: Smartphone },
  { id: "laptops", label: "Laptops", icon: Laptop },
  { id: "books", label: "Books", icon: BookOpen },
  { id: "fashion", label: "Fashion", icon: Shirt },
  { id: "furniture", label: "Furniture", icon: Sofa },
  { id: "services", label: "Services", icon: Wrench },
];

const mockProducts = [
  {
    id: 1,
    title: "iPhone 13 Pro - 256GB",
    price: "₦450,000",
    condition: "Used - Like New",
    location: "Block A, Campus",
    image: "/placeholder.svg",
    seller: "TechGuy99",
    urgent: true,
    posted: "2 hours ago",
  },
  {
    id: 2,
    title: "Calculus Textbook (Stewart 8th Ed)",
    price: "₦8,000",
    condition: "Good",
    location: "Library Area",
    image: "/placeholder.svg",
    seller: "BookWorm",
    posted: "5 hours ago",
  },
  {
    id: 3,
    title: "HP Pavilion Laptop - Core i5",
    price: "₦280,000",
    condition: "Used - Good",
    location: "Off Campus",
    image: "/placeholder.svg",
    seller: "CompSciStudent",
    posted: "1 day ago",
  },
  {
    id: 4,
    title: "Reading Desk + Chair Set",
    price: "₦25,000",
    condition: "Good",
    location: "Main Gate Area",
    image: "/placeholder.svg",
    seller: "GraduatingSoon",
    urgent: true,
    posted: "3 hours ago",
  },
];

const Marketplace = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl module-marketplace border flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Marketplace</h1>
            <p className="text-sm text-muted-foreground">Buy & sell within your campus community</p>
          </div>
        </div>
        <Button variant="hero">
          <Plus className="w-4 h-4" />
          Sell Something
        </Button>
      </div>

      {/* Search */}
      <Card className="glass-card">
        <CardContent className="py-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for items..."
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

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedCategory === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedCategory("all")}
        >
          All
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat.id}
            variant={selectedCategory === cat.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(cat.id)}
            className="gap-1 shrink-0"
          >
            <cat.icon className="w-4 h-4" />
            {cat.label}
          </Button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {mockProducts.map((product) => (
          <Card key={product.id} className="glass-card hover-lift overflow-hidden">
            <div className="aspect-square bg-muted relative">
              <img
                src={product.image}
                alt={product.title}
                className="w-full h-full object-cover"
              />
              {product.urgent && (
                <Badge className="absolute top-2 left-2 bg-destructive">
                  <Zap className="w-3 h-3 mr-1" />
                  Urgent
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-background/80 hover:bg-background h-8 w-8"
              >
                <Heart className="w-4 h-4" />
              </Button>
            </div>
            <CardContent className="p-3">
              <h3 className="font-semibold text-sm line-clamp-2">{product.title}</h3>
              <p className="text-lg font-bold text-primary mt-1">{product.price}</p>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                <MapPin className="w-3 h-3" />
                {product.location}
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  {product.posted}
                </div>
                <Button variant="ghost" size="sm" className="h-7 px-2">
                  <MessageCircle className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Marketplace;

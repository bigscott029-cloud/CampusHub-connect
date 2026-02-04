import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Home,
  MapPin,
  Phone,
  Image as ImageIcon,
  Plus,
  X,
  CheckCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const amenitiesList = [
  { id: "wifi", label: "WiFi Available" },
  { id: "power", label: "24/7 Power Supply" },
  { id: "water", label: "Running Water" },
  { id: "security", label: "Security" },
  { id: "parking", label: "Parking Space" },
  { id: "furnished", label: "Furnished" },
  { id: "kitchen", label: "Kitchen Access" },
  { id: "bathroom", label: "Private Bathroom" },
];

const hostelTypes = [
  "Self-Contain",
  "Single Room",
  "Shared Room",
  "Flat",
  "Apartment",
  "Hostel",
];

const CreateHostelListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    pricePeriod: "yearly",
    location: "",
    hostelType: "",
    phoneNumber: "",
    amenities: [] as string[],
    imageUrls: [] as string[],
  });
  const [newImageUrl, setNewImageUrl] = useState("");

  const handleAmenityToggle = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const addImageUrl = () => {
    if (newImageUrl.trim() && formData.imageUrls.length < 6) {
      setFormData((prev) => ({
        ...prev,
        imageUrls: [...prev.imageUrls, newImageUrl.trim()],
      }));
      setNewImageUrl("");
    }
  };

  const removeImageUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.title || !formData.price || !formData.location || !formData.hostelType || !formData.phoneNumber) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("hostel_listings").insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        price_period: formData.pricePeriod,
        location: formData.location,
        hostel_type: formData.hostelType,
        phone_number: formData.phoneNumber,
        amenities: formData.amenities,
        images: formData.imageUrls,
        status: "pending",
      });

      if (error) throw error;

      // Create admin request
      await supabase.from("admin_requests").insert({
        user_id: user.id,
        request_type: "hostel_listing",
        status: "pending",
      });

      // Create notification for user
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "Listing Submitted",
        description: "Your hostel listing is being reviewed by an admin.",
        type: "listing",
        is_important: true,
      });

      setSubmitted(true);
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("Failed to submit listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-display font-bold">Listing Submitted!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Your post is successfully created and being reviewed for approval by an Admin. 
              You'll receive a notification once it's approved.
            </p>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => navigate("/hostel")}>
                View Listings
              </Button>
              <Button variant="hero" onClick={() => navigate("/messages")}>
                Check Messages
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl module-hostel border flex items-center justify-center">
            <Home className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">List Your Space</h1>
            <p className="text-sm text-muted-foreground">Create a hostel listing</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Listing Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Spacious Self-Contain Near Campus"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your space, facilities, and what makes it unique..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hostelType">Type *</Label>
                <Select
                  value={formData.hostelType}
                  onValueChange={(value) => setFormData({ ...formData, hostelType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostelTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Campus Gate Area"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Pricing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price (₦) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="e.g., 350000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="pricePeriod">Period</Label>
                <Select
                  value={formData.pricePeriod}
                  onValueChange={(value) => setFormData({ ...formData, pricePeriod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yearly">Per Year</SelectItem>
                    <SelectItem value="monthly">Per Month</SelectItem>
                    <SelectItem value="semester">Per Semester</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Amenities</CardTitle>
            <CardDescription>Select all that apply</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {amenitiesList.map((amenity) => (
                <label
                  key={amenity.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    formData.amenities.includes(amenity.id)
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Checkbox
                    checked={formData.amenities.includes(amenity.id)}
                    onCheckedChange={() => handleAmenityToggle(amenity.id)}
                  />
                  <span className="text-sm">{amenity.label}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Images */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Images</CardTitle>
            <CardDescription>Add image URLs (up to 6)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Paste image URL..."
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())}
              />
              <Button type="button" variant="outline" onClick={addImageUrl}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {formData.imageUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {formData.imageUrls.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100"
                      onClick={() => removeImageUrl(i)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+234 801 234 5678"
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              />
              <p className="text-xs text-muted-foreground mt-1">
                This will be visible to interested users
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" variant="hero" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit for Review"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateHostelListing;

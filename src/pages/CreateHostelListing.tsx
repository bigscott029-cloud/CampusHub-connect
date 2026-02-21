import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  X,
  CheckCircle,
  Upload,
  Link2,
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

const hostelTypes = ["Self-Contain", "Single Room", "Shared Room", "Flat", "Apartment", "Hostel"];

const CreateHostelListing = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageUrlInput, setImageUrlInput] = useState("");

  const [formData, setFormData] = useState({
    title: "", description: "", price: "", pricePeriod: "yearly", location: "", hostelType: "", phoneNumber: "",
    amenities: [] as string[], imageUrls: [] as string[],
  });

  const handleAmenityToggle = (amenityId: string) => {
    setFormData(prev => ({ ...prev, amenities: prev.amenities.includes(amenityId) ? prev.amenities.filter(a => a !== amenityId) : [...prev.amenities, amenityId] }));
  };

  const addImageUrl = () => {
    if (imageUrlInput.trim() && formData.imageUrls.length < 6) {
      setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, imageUrlInput.trim()] }));
      setImageUrlInput("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      if (formData.imageUrls.length >= 6) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFormData(prev => ({ ...prev, imageUrls: [...prev.imageUrls, ev.target?.result as string].slice(0, 6) }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImageUrl = (index: number) => {
    setFormData(prev => ({ ...prev, imageUrls: prev.imageUrls.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!formData.title || !formData.price || !formData.location || !formData.hostelType || !formData.phoneNumber) {
      toast.error("Please fill in all required fields"); return;
    }
    setIsSubmitting(true);
    try {
      const httpImages = formData.imageUrls.filter(img => img.startsWith("http"));
      const { error } = await supabase.from("hostel_listings").insert({
        user_id: user.id, title: formData.title, description: formData.description,
        price: parseFloat(formData.price), price_period: formData.pricePeriod,
        location: formData.location, hostel_type: formData.hostelType,
        phone_number: formData.phoneNumber, amenities: formData.amenities,
        images: httpImages, status: "pending",
      });
      if (error) throw error;
      await supabase.from("admin_requests").insert({ user_id: user.id, request_type: "hostel_listing", status: "pending" });
      await supabase.from("notifications").insert({ user_id: user.id, title: "Listing Submitted", description: "Your hostel listing is being reviewed by an admin.", type: "listing", is_important: true });
      setSubmitted(true);
    } catch (error) {
      console.error("Error creating listing:", error);
      toast.error("Failed to submit listing.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card className="glass-card text-center py-12">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto"><CheckCircle className="w-8 h-8 text-success" /></div>
            <h2 className="text-2xl font-display font-bold">Listing Submitted!</h2>
            <p className="text-muted-foreground max-w-md mx-auto">Your post is successfully created and being reviewed for approval by an Admin.</p>
            <div className="flex gap-3 justify-center pt-4">
              <Button variant="outline" onClick={() => navigate("/hostel")}>View Listings</Button>
              <Button variant="hero" onClick={() => navigate("/messages")}>Check Messages</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="w-5 h-5" /></Button>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl module-hostel border flex items-center justify-center"><Home className="w-5 h-5" /></div>
          <div><h1 className="text-2xl font-display font-bold">List Your Space</h1><p className="text-sm text-muted-foreground">Create a hostel listing</p></div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Listing Title *</Label><Input placeholder="e.g., Spacious Self-Contain Near Campus" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></div>
            <div><Label>Description</Label><Textarea placeholder="Describe your space..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={4} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Type *</Label><Select value={formData.hostelType} onValueChange={(v) => setFormData({ ...formData, hostelType: v })}><SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger><SelectContent>{hostelTypes.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div><Label>Location *</Label><Input placeholder="e.g., Campus Gate Area" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Pricing</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Price (₦) *</Label><Input type="number" placeholder="e.g., 350000" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} /></div>
              <div><Label>Period</Label><Select value={formData.pricePeriod} onValueChange={(v) => setFormData({ ...formData, pricePeriod: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="yearly">Per Year</SelectItem><SelectItem value="monthly">Per Month</SelectItem><SelectItem value="semester">Per Semester</SelectItem></SelectContent></Select></div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Amenities</CardTitle></CardHeader>
          <CardContent><div className="grid grid-cols-2 gap-3">{amenitiesList.map(a => (
            <label key={a.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.amenities.includes(a.id) ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
              <Checkbox checked={formData.amenities.includes(a.id)} onCheckedChange={() => handleAmenityToggle(a.id)} /><span className="text-sm">{a.label}</span>
            </label>
          ))}</div></CardContent>
        </Card>

        {/* Images - Device + URL */}
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Images (up to 6)</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="device">
              <TabsList className="w-full"><TabsTrigger value="device" className="flex-1"><Upload className="w-4 h-4 mr-1" />From Device</TabsTrigger><TabsTrigger value="url" className="flex-1"><Link2 className="w-4 h-4 mr-1" />Image URL</TabsTrigger></TabsList>
              <TabsContent value="device" className="pt-4">
                <input ref={imageInputRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={handleFileUpload} />
                <Button type="button" variant="outline" className="w-full" onClick={() => imageInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" />Choose Images & Videos</Button>
              </TabsContent>
              <TabsContent value="url" className="pt-4">
                <div className="flex gap-2"><Input placeholder="Paste image URL..." value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addImageUrl())} /><Button type="button" variant="outline" onClick={addImageUrl}><Plus className="w-4 h-4" /></Button></div>
              </TabsContent>
            </Tabs>
            {formData.imageUrls.length > 0 && (
              <div className="flex gap-2 flex-wrap">{formData.imageUrls.map((url, i) => (
                <div key={i} className="relative group"><img src={url} alt="" className="w-20 h-20 object-cover rounded" /><Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => removeImageUrl(i)}><X className="h-3 w-3" /></Button></div>
              ))}</div>
            )}
            <p className="text-xs text-muted-foreground">{formData.imageUrls.length}/6 added</p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
          <CardContent>
            <div><Label>Phone Number *</Label><Input type="tel" placeholder="+234 801 234 5678" value={formData.phoneNumber} onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })} /></div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" variant="hero" className="flex-1" disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit for Review"}</Button>
        </div>
      </form>
    </div>
  );
};

export default CreateHostelListing;

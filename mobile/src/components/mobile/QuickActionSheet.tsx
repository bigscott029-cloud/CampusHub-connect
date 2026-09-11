import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Ghost, Home, ShoppingBag, Image, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface QuickActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export const QuickActionSheet: React.FC<QuickActionSheetProps> = ({ isOpen, onClose, onPostCreated }) => {
  const { user } = useAuth();
  const [activeType, setActiveType] = useState<"gist" | "anon" | "hostel" | "market">("gist");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [category, setCategory] = useState("general");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please log in to post");
      return;
    }
    if (!content.trim() && !title.trim()) {
      toast.error("Please enter some content");
      return;
    }

    setLoading(true);
    try {
      if (activeType === "gist") {
        const { error } = await supabase.from("posts").insert({
          user_id: user.id,
          content: content.trim(),
          media_url: mediaUrl || null,
          category: category,
          is_anonymous: false,
        });
        if (error) throw error;
        toast.success("Campus Gist posted!");
      } else if (activeType === "anon") {
        const { error } = await supabase.from("posts").insert({
          user_id: user.id,
          content: content.trim(),
          category: "anonymous",
          is_anonymous: true,
        });
        if (error) throw error;
        toast.success("Anonymous confession posted!");
      } else if (activeType === "market") {
        const { error } = await supabase.from("marketplace_listings").insert({
          user_id: user.id,
          title: title.trim(),
          description: content.trim(),
          price: parseFloat(price) || 0,
          category: category,
          images: mediaUrl ? [mediaUrl] : [],
          status: "available",
        });
        if (error) throw error;
        toast.success("Item listed on Marketplace!");
      } else if (activeType === "hostel") {
        const { error } = await supabase.from("hostel_listings").insert({
          user_id: user.id,
          title: title.trim(),
          description: content.trim(),
          price_per_year: parseFloat(price) || 0,
          location: "Campus vicinity",
          images: mediaUrl ? [mediaUrl] : [],
        });
        if (error) throw error;
        toast.success("Hostel listing submitted!");
      }

      setContent("");
      setTitle("");
      setPrice("");
      setMediaUrl("");
      onClose();
      if (onPostCreated) onPostCreated();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="w-full max-w-md bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 shadow-2xl pb-safe"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-400 animate-pulse" />
              Create Campus Snap
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Type Selector Pills */}
          <div className="grid grid-cols-4 gap-2 mb-4 bg-slate-950 p-1.5 rounded-2xl border border-slate-800/80">
            <button
              type="button"
              onClick={() => setActiveType("gist")}
              className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                activeType === "gist"
                  ? "bg-yellow-400 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Camera className="w-4 h-4 mb-1" />
              Gist
            </button>
            <button
              type="button"
              onClick={() => setActiveType("anon")}
              className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                activeType === "anon"
                  ? "bg-purple-500 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Ghost className="w-4 h-4 mb-1" />
              Anon
            </button>
            <button
              type="button"
              onClick={() => setActiveType("market")}
              className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                activeType === "market"
                  ? "bg-blue-500 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShoppingBag className="w-4 h-4 mb-1" />
              Market
            </button>
            <button
              type="button"
              onClick={() => setActiveType("hostel")}
              className={`flex flex-col items-center py-2 px-1 rounded-xl text-xs font-semibold transition-all ${
                activeType === "hostel"
                  ? "bg-emerald-500 text-white shadow-md"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Home className="w-4 h-4 mb-1" />
              Hostel
            </button>
          </div>

          {/* Creation Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {(activeType === "market" || activeType === "hostel") && (
              <input
                type="text"
                placeholder={activeType === "market" ? "Item Title..." : "Hostel Name / Title..."}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                required
              />
            )}

            <textarea
              placeholder={
                activeType === "gist"
                  ? "What's happening on campus?"
                  : activeType === "anon"
                  ? "Share a secret anonymously..."
                  : activeType === "market"
                  ? "Describe the item, condition, specs..."
                  : "Describe the hostel, room type, features..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400 resize-none"
              required
            />

            {(activeType === "market" || activeType === "hostel") && (
              <input
                type="number"
                placeholder={activeType === "market" ? "Price (₦)" : "Price per year (₦)"}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400"
                required
              />
            )}

            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="Image URL (optional)..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-yellow-400"
              />
              <button
                type="button"
                onClick={() => {
                  const sampleImages = [
                    "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=600&auto=format&fit=crop",
                    "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&auto=format&fit=crop"
                  ];
                  const randomImg = sampleImages[Math.floor(Math.random() * sampleImages.length)];
                  setMediaUrl(randomImg);
                  toast.info("Sample photo attached");
                }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-2.5 rounded-xl text-xs flex items-center gap-1 font-medium"
              >
                <Image className="w-4 h-4 text-yellow-400" />
                Attach
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              type="submit"
              className="w-full mt-2 py-3.5 rounded-2xl bg-yellow-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-400/20 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? "Publishing..." : "Publish Post"}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
